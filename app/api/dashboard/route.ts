import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { RowDataPacket } from 'mysql2';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get('projectId') || '1';

  try {
    // ======================================================
    // 1. PROJECT REVENUE
    // ======================================================
    const [projectRows] = await pool.query<RowDataPacket[]>(`
      SELECT 
        COALESCE(SUM(bi.qty * bi.rate), 0) AS project_value
      FROM projects p
      LEFT JOIN boqs b ON b.project_id = p.id
      LEFT JOIN boq_items bi ON bi.boq_id = b.id
      WHERE p.id = ?
    `, [projectId]);

    const revenue = Number(projectRows[0]?.project_value || 0);

    // ======================================================
    // 2. COST SUMMARY (PAID / UNPAID)
    // ======================================================
    const [mrSummaryRows] = await pool.query<RowDataPacket[]>(`
      SELECT 
        mr.status,
        SUM(li.qty * li.unit_price) AS subtotal
      FROM material_requests mr
      JOIN mr_line_items li ON li.mr_id = mr.id
      WHERE mr.project_id = ?
      GROUP BY mr.status
    `, [projectId]);

    let paidSubtotal = 0;
    let unpaidSubtotal = 0;

    mrSummaryRows.forEach((row) => {
      if (row.status === 'Paid') paidSubtotal = Number(row.subtotal || 0);
      if (row.status === 'Unpaid') unpaidSubtotal = Number(row.subtotal || 0);
    });

    const actualCost = paidSubtotal * 1.05;
    const committedCost = unpaidSubtotal * 1.05;
    const totalExpenses = actualCost + committedCost;

    const runningPnL = revenue - totalExpenses;
    const profitMargin = revenue > 0 ? (runningPnL / revenue) * 100 : 0;

    // ======================================================
    // 3. MATERIAL REQUESTS (NO GROUP BY VERSION)
    // ======================================================
    const [mrs] = await pool.query<RowDataPacket[]>(`
      SELECT 
        mr.id,
        mr.mr_number,
        mr.required_date,
        mr.purpose,
        mr.stage,
        mr.status,
        mr.created_at,
        r.name AS requestor_name,
        s.name AS supplier_name
      FROM material_requests mr
      JOIN requestors r ON mr.requestor_id = r.id
      JOIN suppliers s ON mr.supplier_id = s.id
      WHERE mr.project_id = ?
      ORDER BY mr.created_at DESC
    `, [projectId]);

    // ======================================================
    // 4. SUBTOTALS (SEPARATE AGGREGATION)
    // ======================================================
    const [subtotals] = await pool.query<RowDataPacket[]>(`
      SELECT 
        mr_id,
        SUM(qty * unit_price) AS subtotal
      FROM mr_line_items
      GROUP BY mr_id
    `);

    const subtotalMap = new Map<number, number>();
    subtotals.forEach((r: any) => {
      subtotalMap.set(r.mr_id, Number(r.subtotal || 0));
    });

    // ======================================================
    // 5. TAGS (SEPARATE AGGREGATION)
    // ======================================================
    const [tags] = await pool.query<RowDataPacket[]>(`
      SELECT mt.mr_id, t.name
      FROM mr_tags mt
      JOIN tags t ON mt.tag_id = t.id
    `);

    const tagMap = new Map<number, string[]>();
    tags.forEach((t: any) => {
      if (!tagMap.has(t.mr_id)) tagMap.set(t.mr_id, []);
      tagMap.get(t.mr_id)!.push(t.name);
    });

    // ======================================================
    // 6. OVERRUN CHECK (SAFE)
    // ======================================================
    const [overruns] = await pool.query<RowDataPacket[]>(`
      SELECT DISTINCT li.mr_id
      FROM mr_line_items li
      JOIN boq_items bi ON li.boq_item_id = bi.id
      WHERE (li.qty * li.unit_price) > (bi.qty * bi.rate)
    `);

    const overrunSet = new Set(overruns.map((r: any) => r.mr_id));

    // ======================================================
    // 7. BUILD FINAL RESPONSE
    // ======================================================
    const materialRequests = mrs.map((mr: any) => {
      const subtotal = subtotalMap.get(mr.id) || 0;
      const assignedTags = tagMap.get(mr.id) || [];

      if (overrunSet.has(mr.id)) {
        assignedTags.push('Budget overrun');
      }

      return {
        id: mr.id,
        mr_number: mr.mr_number,
        date: new Date(mr.required_date).toLocaleDateString('en-GB'),
        requestor_name: mr.requestor_name,
        supplier_name: mr.supplier_name,
        purpose: mr.purpose,
        stage: mr.stage,
        status: mr.status,

        subtotal,
        vat: subtotal * 0.05,
        value: subtotal * 1.05,

        tags: assignedTags
      };
    });

    // ======================================================
    // 8. RESPONSE
    // ======================================================
    return NextResponse.json({
      metrics: {
        revenue,
        actualCost,
        committedCost,
        totalExpenses,
        runningPnL,
        profitMargin: Number(profitMargin.toFixed(2))
      },
      materialRequests
    });

  } catch (err: any) {
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}