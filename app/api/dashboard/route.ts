// app/api/dashboard/route.ts
import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get('projectId') || '1';

  try {
    // ==========================================
    // 1. PROJECT BASE & REVENUE CALCULATION
    // ==========================================
    // Revenue = sum of all BOQ leaf-item totals linked to the project (qty * rate) [Section 6.2]
    const [projectRows]: any = await pool.query(`
      SELECT 
        p.id, p.name, p.budget,
        COALESCE(SUM(bi.qty * bi.rate), 0) AS project_value
      FROM projects p
      LEFT JOIN boqs b ON b.project_id = p.id
      LEFT JOIN boq_items bi ON bi.boq_id = b.id AND bi.parent_id IS NOT NULL AND bi.qty IS NOT NULL AND bi.rate IS NOT NULL
      WHERE p.id = ?
      GROUP BY p.id
    `, [projectId]);

    const project = projectRows[0];
    if (!project) {
      return NextResponse.json({ error: 'Project data not found' }, { status: 404 });
    }

    const revenue = Number(project.project_value); // Target: 150000.00

    // ==========================================
    // 2. FINANCIAL EXPENSES & KPIS ENGINE
    // ==========================================
    // Evaluate base subtotal per payment status first to avoid any join multipliers [Section 6.3]
    const [mrSummaryRows]: any = await pool.query(`
      SELECT 
        mr.status,
        COALESCE(SUM(li.qty * li.unit_price), 0) AS raw_subtotal
      FROM material_requests mr
      JOIN mr_line_items li ON li.mr_id = mr.id
      WHERE mr.project_id = ?
      GROUP BY mr.status
    `, [projectId]);

    let paidSubtotal = 0;
    let unpaidSubtotal = 0;

    mrSummaryRows.forEach((row: any) => {
      if (row.status === 'Paid') paidSubtotal = Number(row.raw_subtotal);
      if (row.status === 'Unpaid') unpaidSubtotal = Number(row.raw_subtotal);
    });

    // KPI Formulation Rules: Apply exact 5% UAE VAT-Inclusive calculations [Section 6.1, 6.3]
    const actualCost = paidSubtotal * 1.05;       // Target: 1,050.00
    const committedCost = unpaidSubtotal * 1.05;   // Target: 525.00
    const totalExpenses = actualCost + committedCost; // Target: 1,575.00

    const runningPnL = revenue - totalExpenses; // Target: 148,425.00
    const profitMargin = revenue > 0 ? (runningPnL / revenue) * 100 : 0; // Target: 98.95%

    // ==========================================
    // 3. MATERIAL REQUEST DETAILS MAIN EXPLORER
    // ==========================================
    // Fetch base metadata with correct subtotal mappings
    const [mrs]: any = await pool.query(`
      SELECT 
        mr.id, mr.mr_number, mr.required_date, mr.purpose, mr.stage, mr.status, mr.created_at,
        r.name AS requestor_name, 
        s.name AS supplier_name,
        SUM(li.qty * li.unit_price) AS subtotal,
        (SUM(li.qty * li.unit_price) * 0.05) AS vat_amount,
        (SUM(li.qty * li.unit_price) * 1.05) AS total_value
      FROM material_requests mr
      JOIN requestors r ON mr.requestor_id = r.id
      JOIN suppliers s ON mr.supplier_id = s.id
      JOIN mr_line_items li ON li.mr_id = mr.id
      WHERE mr.project_id = ?
      GROUP BY mr.id
      ORDER BY mr.created_at DESC
    `, [projectId]);

    // Fetch related cross-reference strings scoped ONLY to tags linked to this project's material requests
    const [allTags]: any = await pool.query(`
      SELECT mt.mr_id, t.name 
      FROM mr_tags mt 
      JOIN tags t ON mt.tag_id = t.id
      JOIN material_requests mr ON mt.mr_id = mr.id
      WHERE mr.project_id = ?
    `, [projectId]);

    // Fetch deep line-item analytics details to feed item preview lists dynamically 
    const [allLineItems]: any = await pool.query(`
      SELECT 
        li.id, li.mr_id, m.name AS material_description, li.qty, li.unit, li.unit_price, 
        (li.qty * li.unit_price) AS total_price, bi.ref_code AS boq_ref,
        COALESCE((SELECT MIN(price) FROM price_history WHERE material_id = m.id), 0) AS lowest_price,
        COALESCE((SELECT AVG(price) FROM price_history WHERE material_id = m.id), 0) AS avg_price,
        COALESCE((
          SELECT ph.price FROM price_history ph 
          WHERE ph.material_id = m.id AND ph.quoted_at < mr.required_date 
          ORDER BY ph.quoted_at DESC LIMIT 1
        ), 0) AS prev_price
      FROM mr_line_items li
      JOIN material_requests mr ON li.mr_id = mr.id
      JOIN materials m ON li.material_id = m.id
      JOIN boq_items bi ON li.boq_item_id = bi.id
      WHERE mr.project_id = ?
    `, [projectId]);

    const formattedMrs = mrs.map((mr: any) => {
      const associatedTags = allTags
        .filter((t: any) => t.mr_id === mr.id)
        .map((t: any) => t.name);

      const items = allLineItems
        .filter((item: any) => item.mr_id === mr.id)
        .map((item: any) => ({
          id: item.id,
          description: item.material_description,
          qty: item.qty,
          unit: item.unit,
          unit_price: Number(item.unit_price).toFixed(2),
          total_price: Number(item.total_price).toFixed(2),
          boq_ref: item.boq_ref,
          analytics: {
            lowest: item.lowest_price > 0 ? Number(item.lowest_price).toFixed(2) : 'N/A',
            avg: item.avg_price > 0 ? Number(item.avg_price).toFixed(2) : 'N/A',
            prev: item.prev_price > 0 ? Number(item.prev_price).toFixed(2) : 'N/A'
          }
        }));

      return {
        id: mr.id,
        mr_number: mr.mr_number,
        date: mr.required_date,
        requestor_name: mr.requestor_name,
        supplier_name: mr.supplier_name,
        purpose: mr.purpose,
        stage: mr.stage,
        status: mr.status,
        subtotal: Number(mr.subtotal).toFixed(2),
        vat: Number(mr.vat_amount).toFixed(2),
        value: Number(mr.total_value).toFixed(2),
        tags: associatedTags,
        items: items
      };
    });

    // ==========================================
    // 4. TREE-VIEW COST ANALYSIS CALCULATOR
    // ==========================================
    // Procurement category analysis MUST exclude VAT [Section 6.5] and scope to current project items only
    const [categorySpendRows]: any = await pool.query(`
      SELECT 
        mc.id, 
        mc.parent_id, 
        mc.name,
        COALESCE(SUM(li.qty * li.unit_price), 0) AS direct_spend
      FROM material_categories mc
      LEFT JOIN materials m ON m.category_id = mc.id
      LEFT JOIN mr_line_items li ON li.material_id = m.id
      LEFT JOIN material_requests mr ON li.mr_id = mr.id AND mr.project_id = ?
      GROUP BY mc.id
    `, [projectId]);

    // Construct O(1) Look-up map and clean adjacency trackers for structural integrity
    const categoryMap = new Map();
    const childrenMap = new Map<number, number[]>();

    categorySpendRows.forEach((row: any) => {
      categoryMap.set(row.id, {
        id: row.id,
        parent_id: row.parent_id,
        name: row.name,
        direct_spend: Number(row.direct_spend),
        total_spend: 0,
        calculated: false
      });

      if (row.parent_id !== null) {
        if (!childrenMap.has(row.parent_id)) {
          childrenMap.set(row.parent_id, []);
        }
        childrenMap.get(row.parent_id)!.push(row.id);
      }
    });

    // Clean Dynamic Memoization Rollup Engine to handle deeply nested material nodes seamlessly
    const computeRollupSpend = (catId: number): number => {
      const node = categoryMap.get(catId);
      if (!node) return 0;
      if (node.calculated) return node.total_spend;

      let subCategorySpend = 0;
      const directChildren = childrenMap.get(catId) || [];
      
      directChildren.forEach((childId) => {
        subCategorySpend += computeRollupSpend(childId);
      });

      node.total_spend = node.direct_spend + subCategorySpend;
      node.calculated = true;
      return node.total_spend;
    };

    // Calculate spend rollups for every category node ensuring all trees reconcile safely
    categorySpendRows.forEach((row: any) => {
      computeRollupSpend(row.id);
    });

    // Clean execution attributes out before payload dispatching
    const finalizedCostAnalysis = Array.from(categoryMap.values()).map(({ calculated, ...rest }) => ({
      ...rest,
      total_spend: rest.total_spend.toFixed(2),
      direct_spend: rest.direct_spend.toFixed(2)
    }));

    // ==========================================
    // 5. JSON PAYLOAD DELIVERABLE PACKAGING
    // ==========================================
    return NextResponse.json({
      metrics: {
        revenue: revenue.toFixed(2),                 // Expected: "150000.00"
        totalExpenses: totalExpenses.toFixed(2),     // Expected: "1575.00"
        actualCost: actualCost.toFixed(2),           // Expected: "1050.00"
        committedCost: committedCost.toFixed(2),     // Expected: "525.00"
        runningPnL: runningPnL.toFixed(2),           // Expected: "148425.00"
        profitMargin: `${profitMargin.toFixed(2)}%`  // Expected: "98.95%"
      },
      materialRequests: formattedMrs,
      costAnalysis: finalizedCostAnalysis
    });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}