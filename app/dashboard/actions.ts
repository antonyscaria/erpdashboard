'use server';

import { pool } from '@/lib/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export interface DashboardFilters {
  searchQuery?: string;
  requestor?: string;
  status?: string;
}

export interface CostNode {
  id: number;
  parent_id: number | null;
  name: string;
  direct_spend?: number;
  total_spend: number;
  children: CostNode[];
}

///////////////////////////////
// 1. DASHBOARD METRICS
///////////////////////////////
export async function getDashboardMetrics(projectId: string = '1') {
  const [projectRows] = await pool.query<RowDataPacket[]>(`
    SELECT COALESCE(SUM(bi.qty * bi.rate), 0) AS project_value
    FROM projects p
    LEFT JOIN boqs b ON b.project_id = p.id
    LEFT JOIN boq_items bi ON bi.boq_id = b.id
    WHERE p.id = ? AND bi.qty IS NOT NULL AND bi.rate IS NOT NULL
  `, [projectId]);

  const [mrSummaryRows] = await pool.query<RowDataPacket[]>(`
    SELECT mr.status, COALESCE(SUM(li.qty * li.unit_price), 0) AS raw_subtotal
    FROM material_requests mr
    JOIN mr_line_items li ON li.mr_id = mr.id
    WHERE mr.project_id = ?
    GROUP BY mr.status
  `, [projectId]);

  let paidSubtotal = 0;
  let unpaidSubtotal = 0;

  mrSummaryRows.forEach((row) => {
    if (row.status === 'Paid') paidSubtotal = Number(row.raw_subtotal);
    if (row.status === 'Unpaid') unpaidSubtotal = Number(row.raw_subtotal);
  });

  const revenue = Number(projectRows[0]?.project_value || 0);
  const actualCost = paidSubtotal * 1.05;
  const committedCost = unpaidSubtotal * 1.05;
  const totalExpenses = actualCost + committedCost;
  const runningPnL = revenue - totalExpenses;
  const profitMargin = revenue > 0 ? (runningPnL / revenue) * 100 : 0;

  return {
    revenue,
    actualCost,
    committedCost,
    totalExpenses,
    runningPnL,
    profitMargin: Number(profitMargin.toFixed(2)),
  };
}

///////////////////////////////
// 2. MATERIAL REQUESTS
///////////////////////////////
export async function getMaterialRequests(
  projectId: string = '1',
  filters: any = {}
) {

  let query = `
SELECT 
  mr.id,
  mr.mr_number,
  mr.required_date,
  mr.purpose,
  mr.stage,
  mr.status,
  mr.created_at,

  r.name AS requestor_name,
  s.name AS supplier_name,

  COALESCE(li.subtotal, 0) AS subtotal,
  COALESCE(tags.tag_list, '') AS tag_list,

  COALESCE(overrun.is_overrun, 0) AS is_overrun

FROM material_requests mr
JOIN requestors r ON mr.requestor_id = r.id
JOIN suppliers s ON mr.supplier_id = s.id

/* SUBTOTAL (no GROUP BY in main query) */
LEFT JOIN (
  SELECT mr_id, SUM(qty * unit_price) AS subtotal
  FROM mr_line_items
  GROUP BY mr_id
) li ON li.mr_id = mr.id

/* TAGS */
LEFT JOIN (
  SELECT 
    mt.mr_id,
    GROUP_CONCAT(DISTINCT t.name SEPARATOR ',') AS tag_list
  FROM mr_tags mt
  JOIN tags t ON mt.tag_id = t.id
  GROUP BY mt.mr_id
) tags ON tags.mr_id = mr.id

/* OVERRUN CHECK */
LEFT JOIN (
  SELECT 
    li2.mr_id,
    CASE 
      WHEN SUM(li2.qty * li2.unit_price) > SUM(bi.qty * bi.rate)
      THEN 1 ELSE 0
    END AS is_overrun
  FROM mr_line_items li2
  JOIN boq_items bi ON li2.boq_item_id = bi.id
  GROUP BY li2.mr_id
) overrun ON overrun.mr_id = mr.id

WHERE mr.project_id = ?
`;

  const params: any[] = [projectId];

  if (filters.status && filters.status !== 'Paid & Unpaid') {
    query += ` AND mr.status = ?`;
    params.push(filters.status);
  }

  if (filters.requestor && filters.requestor !== 'All Requestor') {
    query += ` AND r.name = ?`;
    params.push(filters.requestor);
  }

  if (filters.searchQuery) {
    query += ` AND (mr.mr_number LIKE ? OR r.name LIKE ? OR mr.purpose LIKE ?)`;
    const s = `%${filters.searchQuery}%`;
    params.push(s, s, s);
  }

  query += ` ORDER BY mr.created_at DESC`;

  const [mrs] = await pool.query<RowDataPacket[]>(query, params);

  return mrs.map((mr) => {
    const assignedTags = mr.tag_list
      ? mr.tag_list.split(',').filter(Boolean)
      : [];

    if (mr.is_overrun && !assignedTags.includes('Budget overrun')) {
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
      subtotal: Number(mr.subtotal),
      vat: Number(mr.subtotal) * 0.05,
      value: Number(mr.subtotal) * 1.05,
      tags: assignedTags,
    };
  });
}
///////////////////////////////
// 3. MR PREVIEW
///////////////////////////////
export async function getMRPreviewDetails(mrId: number) {
  const [mrMeta] = await pool.query<RowDataPacket[]>(`
    SELECT 
      mr.mr_number,
      mr.stage,
      mr.required_date,
      r.name AS requestor_name,
      s.name AS supplier_name
    FROM material_requests mr
    JOIN requestors r ON mr.requestor_id = r.id
    JOIN suppliers s ON mr.supplier_id = s.id
    WHERE mr.id = ?
  `, [mrId]);

  const [lineItems] = await pool.query<RowDataPacket[]>(`
    SELECT 
      li.id,
      m.name AS material_description,
      li.qty,
      li.unit,
      li.unit_price,
      (li.qty * li.unit_price) AS total_price,
      bi.ref_code AS boq_ref,

      (
        SELECT MIN(price)
        FROM price_history ph
        WHERE ph.material_id = m.id
      ) AS lowest_price,

      (
        SELECT AVG(price)
        FROM price_history ph
        WHERE ph.material_id = m.id
      ) AS avg_price,

      (
        SELECT ph2.price
        FROM price_history ph2
        WHERE ph2.material_id = m.id
          AND ph2.quoted_at < mr.required_date
        ORDER BY ph2.quoted_at DESC
        LIMIT 1
      ) AS prev_price

    FROM mr_line_items li
    JOIN material_requests mr ON li.mr_id = mr.id
    JOIN materials m ON li.material_id = m.id
    JOIN boq_items bi ON li.boq_item_id = bi.id
    WHERE li.mr_id = ?
  `, [mrId]);

  const enrichedItems = lineItems.map((item) => ({
    id: item.id,
    description: item.material_description,
    qty: Number(item.qty),
    unit: item.unit,
    unit_price: Number(item.unit_price),
    total_price: Number(item.total_price),
    boq_ref: item.boq_ref,
    lowest: item.lowest_price ? `AED ${Number(item.lowest_price).toFixed(2)}` : 'N/A',
    avg: item.avg_price ? `AED ${Number(item.avg_price).toFixed(2)}` : 'N/A',
    prev: item.prev_price ? `AED ${Number(item.prev_price).toFixed(2)}` : 'N/A',
  }));

  const subtotal = enrichedItems.reduce(
    (acc, curr) => acc + (curr.total_price || 0),
    0
  );

  return {
    metadata: mrMeta[0] || null,
    items: enrichedItems,
    subtotal,
    totalWithVat: subtotal * 1.05,
  };
}

///////////////////////////////
// 4. COST TREE (FIXED)
///////////////////////////////
export async function getCostAnalysisTree(
  projectId: string = '1',
  type: 'Materials' | 'BOQ'
): Promise<CostNode[]> {

  if (type === 'Materials') {
    const [rows] = await pool.query<RowDataPacket[]>(`
      SELECT 
        mc.id,
        mc.parent_id,
        mc.name,
        COALESCE(SUM(li.qty * li.unit_price), 0) AS direct_spend
      FROM material_categories mc
      LEFT JOIN materials m ON m.category_id = mc.id
      LEFT JOIN mr_line_items li ON li.material_id = m.id
      LEFT JOIN material_requests mr 
        ON li.mr_id = mr.id AND mr.project_id = ?
      GROUP BY mc.id, mc.parent_id, mc.name
    `, [projectId]);

    const treeMap = new Map<number, CostNode>();
    rows.forEach(r => {
      treeMap.set(r.id, {
        id: Number(r.id),
        parent_id: r.parent_id ? Number(r.parent_id) : null,
        name: String(r.name),
        direct_spend: Number(r.direct_spend),
        total_spend: Number(r.direct_spend),
        children: []
      });
    });

    const rootNodes: CostNode[] = [];
    const visited = new Set<number>();

    treeMap.forEach(node => {
      if (node.parent_id === null) rootNodes.push(node);
      else treeMap.get(node.parent_id)?.children.push(node);
    });

    const calculateRollup = (node: CostNode): number => {
      if (visited.has(node.id)) return 0;
      visited.add(node.id);

      let sum = node.total_spend;
      node.children.forEach(child => {
        sum += calculateRollup(child);
      });

      node.total_spend = sum;
      return sum;
    };

    rootNodes.forEach(calculateRollup);
    return rootNodes;
  }

  // BOQ branch unchanged (safe)
  const [rows] = await pool.query<RowDataPacket[]>(`
    SELECT bi.id, bi.parent_id, bi.name,
           COALESCE((bi.qty * bi.rate), 0) AS total_spend
    FROM boq_items bi
    JOIN boqs b ON bi.boq_id = b.id
    WHERE b.project_id = ?
  `, [projectId]);

  const treeMap = new Map<number, CostNode>();
  rows.forEach(r => {
    treeMap.set(r.id, {
      id: Number(r.id),
      parent_id: r.parent_id ? Number(r.parent_id) : null,
      name: String(r.name),
      direct_spend: Number(r.total_spend),
      total_spend: Number(r.total_spend),
      children: []
    });
  });

  const rootNodes: CostNode[] = [];
  treeMap.forEach(node => {
    if (node.parent_id === null) rootNodes.push(node);
    else treeMap.get(node.parent_id)?.children.push(node);
  });

  const calculateRollup = (node: CostNode): number => {
    let sum = node.total_spend;
    node.children.forEach(child => sum += calculateRollup(child));
    node.total_spend = sum;
    return sum;
  };

  rootNodes.forEach(calculateRollup);
  return rootNodes;
}

///////////////////////////////
// 5. TAG INSERT
///////////////////////////////
export async function addTagToMR(mrId: number, tagName: string) {
  const [existingTag] = await pool.query<RowDataPacket[]>(
    'SELECT id FROM tags WHERE name = ?',
    [tagName]
  );

  let tagId: number;

  if (existingTag.length > 0) {
    tagId = existingTag[0].id;
  } else {
    const [newTag] = await pool.query<ResultSetHeader>(
      'INSERT INTO tags (name) VALUES (?)',
      [tagName]
    );
    tagId = newTag.insertId;
  }

  await pool.query(
    'INSERT IGNORE INTO mr_tags (mr_id, tag_id) VALUES (?, ?)',
    [mrId, tagId]
  );

  return { success: true };
}

///////////////////////////////
// 6. REVENUE ITEMS
///////////////////////////////
export async function getRevenueItems(projectId: string = "1") {
  const [rows] = await pool.query<RowDataPacket[]>(`
    SELECT
      b.id,
      SUM(COALESCE(bi.qty,0) * COALESCE(bi.rate,0)) AS total_value
    FROM boqs b
    LEFT JOIN boq_items bi ON bi.boq_id = b.id
    WHERE b.project_id = ?
    GROUP BY b.id
    ORDER BY b.id
  `, [projectId]);

  return rows.map((row) => ({
    id: row.id,
    boq_code: `BOQ-${String(row.id).padStart(3, "0")}`,
    total_value: Number(row.total_value || 0),
  }));
}

///////////////////////////////
// 7. PROJECT CONTEXT
///////////////////////////////
export async function getProjectContext(projectId: string = '1') {
  const [rows] = await pool.query<RowDataPacket[]>(`
    SELECT name AS project_name FROM projects WHERE id = ?
  `, [projectId]);

  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - 7);

  const formatDate = (d: Date) =>
    d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }).toUpperCase();

  return {
    projectName: rows[0]?.project_name || 'Unknown Project',
    reportingPeriod: `${formatDate(start)} - ${formatDate(end)}, ${end.getFullYear()}`
  };
}