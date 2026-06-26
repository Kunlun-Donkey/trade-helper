import { useMemo } from 'react';
import { Row, Col, Card, Statistic, Table, Tag, Empty } from 'antd';
import {
  ShoppingCartOutlined, DollarOutlined, RiseOutlined, InboxOutlined,
} from '@ant-design/icons';
import ReactECharts from 'echarts-for-react';

interface Props {
  reportType: string;
  data: Record<string, unknown>[];
  fileName: string;
}

// Fuzzy column name matching
function findCol(keys: string[], patterns: string[]): string | null {
  const lower = keys.map((k) => k.toLowerCase());
  for (const pattern of patterns) {
    const idx = lower.findIndex((k) => k.includes(pattern));
    if (idx !== -1) return keys[idx];
  }
  return null;
}

function toNum(val: unknown): number {
  if (typeof val === 'number') return val;
  if (typeof val === 'string') {
    const cleaned = val.replace(/[$,¥€£%]/g, '').trim();
    const n = parseFloat(cleaned);
    return isNaN(n) ? 0 : n;
  }
  return 0;
}

// ─── ORDER REPORT ───────────────────────────────────────────
function OrderAnalysis({ data }: { data: Record<string, unknown>[] }) {
  const keys = data.length > 0 ? Object.keys(data[0]) : [];
  const orderIdCol = findCol(keys, ['order-id', 'order id', 'orderid', '订单编号', '订单号']);
  const asinCol = findCol(keys, ['asin']);
  const qtyCol = findCol(keys, ['quantity', 'qty', '数量']);
  const priceCol = findCol(keys, ['item-price', 'price', 'amount', 'sales', '销售额', '金额']);
  const statusCol = findCol(keys, ['order-status', 'status', '状态']);
  const titleCol = findCol(keys, ['product-name', 'title', '商品名称', '产品名']);

  const stats = useMemo(() => {
    const uniqueOrders = new Set(data.map((r) => r[orderIdCol || ''])).size || data.length;
    const totalSales = data.reduce((s, r) => s + toNum(r[priceCol || '']), 0);
    const avgOrderValue = uniqueOrders > 0 ? totalSales / uniqueOrders : 0;
    const shipped = statusCol
      ? data.filter((r) => String(r[statusCol]).toLowerCase().includes('ship')).length
      : 0;
    const shippedRate = data.length > 0 ? (shipped / data.length) * 100 : 0;
    return { uniqueOrders, totalSales, avgOrderValue, shippedRate };
  }, [data, orderIdCol, priceCol, statusCol]);

  const chartOption = useMemo(() => {
    if (!asinCol) return null;
    const asinMap: Record<string, number> = {};
    data.forEach((r) => {
      const asin = String(r[asinCol] || 'Unknown');
      asinMap[asin] = (asinMap[asin] || 0) + toNum(r[qtyCol || ''] || 1);
    });
    const sorted = Object.entries(asinMap).sort((a, b) => b[1] - a[1]).slice(0, 10);
    return {
      title: { text: 'ASIN 销量 Top 10', left: 'center', textStyle: { fontSize: 14 } },
      tooltip: { trigger: 'axis' as const },
      grid: { left: 120, right: 30, top: 40, bottom: 30 },
      xAxis: { type: 'value' as const },
      yAxis: { type: 'category' as const, data: sorted.map((s) => s[0]).reverse() },
      series: [{ type: 'bar' as const, data: sorted.map((s) => s[1]).reverse(), itemStyle: { color: '#1677ff' } }],
    };
  }, [data, asinCol, qtyCol]);

  const columns = keys.slice(0, 8).map((key) => ({
    title: key, dataIndex: key, key, ellipsis: true,
    render: (v: unknown) => (statusCol && key === statusCol
      ? <Tag color={String(v).toLowerCase().includes('ship') ? 'green' : 'orange'}>{String(v)}</Tag>
      : String(v ?? '')),
  }));

  return (
    <>
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}><Card size="small"><Statistic title="总订单数" value={stats.uniqueOrders} prefix={<ShoppingCartOutlined />} /></Card></Col>
        <Col span={6}><Card size="small"><Statistic title="总销售额" value={stats.totalSales} prefix={<DollarOutlined />} precision={2} /></Card></Col>
        <Col span={6}><Card size="small"><Statistic title="平均客单价" value={stats.avgOrderValue} prefix="$" precision={2} /></Card></Col>
        <Col span={6}><Card size="small"><Statistic title="已发货率" value={stats.shippedRate} suffix="%" precision={1} /></Card></Col>
      </Row>
      {chartOption && <Card size="small" style={{ marginBottom: 24 }}><ReactECharts option={chartOption} style={{ height: 300 }} /></Card>}
      <Card title="明细数据" size="small">
        <Table dataSource={data.map((r, i) => ({ ...r, _key: i }))} columns={columns} rowKey="_key" size="small" scroll={{ x: true }} pagination={{ pageSize: 15 }} />
      </Card>
    </>
  );
}

// ─── BUSINESS REPORT ────────────────────────────────────────
function BusinessAnalysis({ data }: { data: Record<string, unknown>[] }) {
  const keys = data.length > 0 ? Object.keys(data[0]) : [];
  const asinCol = findCol(keys, ['asin', 'child asin', '(child) asin']);
  const titleCol = findCol(keys, ['title', '商品名称', 'product']);
  const sessionsCol = findCol(keys, ['session', '会话']);
  const convCol = findCol(keys, ['unit session percentage', 'conversion', '转化率']);
  const ordersCol = findCol(keys, ['units ordered', 'ordered', '已订购商品数', '订单量']);
  const revenueCol = findCol(keys, ['ordered product sales', 'revenue', 'sales', '销售额']);

  const stats = useMemo(() => {
    const totalSessions = data.reduce((s, r) => s + toNum(r[sessionsCol || '']), 0);
    const totalOrders = data.reduce((s, r) => s + toNum(r[ordersCol || '']), 0);
    const totalRevenue = data.reduce((s, r) => s + toNum(r[revenueCol || '']), 0);
    const avgConv = data.length > 0
      ? data.reduce((s, r) => s + toNum(r[convCol || '']), 0) / data.length
      : 0;
    return { totalSessions, totalOrders, totalRevenue, avgConv };
  }, [data, sessionsCol, ordersCol, revenueCol, convCol]);

  const chartOption = useMemo(() => {
    if (!asinCol || !sessionsCol) return null;
    const items = data.slice(0, 15).map((r) => ({
      name: String(r[asinCol] || r[titleCol || ''] || 'N/A').slice(0, 20),
      sessions: toNum(r[sessionsCol || '']),
      orders: toNum(r[ordersCol || '']),
    }));
    return {
      title: { text: 'Sessions vs 订单量', left: 'center', textStyle: { fontSize: 14 } },
      tooltip: { trigger: 'axis' as const },
      legend: { bottom: 0 },
      grid: { left: 50, right: 30, top: 40, bottom: 40 },
      xAxis: { type: 'category' as const, data: items.map((i) => i.name), axisLabel: { rotate: 30, fontSize: 10 } },
      yAxis: [
        { type: 'value' as const, name: 'Sessions' },
        { type: 'value' as const, name: 'Orders' },
      ],
      series: [
        { name: 'Sessions', type: 'bar' as const, data: items.map((i) => i.sessions), itemStyle: { color: '#91caff' } },
        { name: 'Orders', type: 'bar' as const, yAxisIndex: 1, data: items.map((i) => i.orders), itemStyle: { color: '#1677ff' } },
      ],
    };
  }, [data, asinCol, titleCol, sessionsCol, ordersCol]);

  const columns = keys.slice(0, 8).map((key) => ({ title: key, dataIndex: key, key, ellipsis: true }));

  return (
    <>
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}><Card size="small"><Statistic title="总Sessions" value={stats.totalSessions} prefix={<RiseOutlined />} /></Card></Col>
        <Col span={6}><Card size="small"><Statistic title="平均转化率" value={stats.avgConv} suffix="%" precision={1} /></Card></Col>
        <Col span={6}><Card size="small"><Statistic title="总订单量" value={stats.totalOrders} prefix={<ShoppingCartOutlined />} /></Card></Col>
        <Col span={6}><Card size="small"><Statistic title="总收入" value={stats.totalRevenue} prefix={<DollarOutlined />} precision={2} /></Card></Col>
      </Row>
      {chartOption && <Card size="small" style={{ marginBottom: 24 }}><ReactECharts option={chartOption} style={{ height: 300 }} /></Card>}
      <Card title="明细数据" size="small">
        <Table dataSource={data.map((r, i) => ({ ...r, _key: i }))} columns={columns} rowKey="_key" size="small" scroll={{ x: true }} pagination={{ pageSize: 15 }} />
      </Card>
    </>
  );
}

// ─── INVENTORY REPORT ───────────────────────────────────────
function InventoryAnalysis({ data }: { data: Record<string, unknown>[] }) {
  const keys = data.length > 0 ? Object.keys(data[0]) : [];
  const skuCol = findCol(keys, ['sku', 'seller-sku', 'msku']);
  const availableCol = findCol(keys, ['afn-fulfillable', 'available', '可售', 'fulfillable']);
  const inboundCol = findCol(keys, ['afn-inbound', 'inbound', '入库中']);
  const reservedCol = findCol(keys, ['afn-reserved', 'reserved', '预留']);
  const unsellableCol = findCol(keys, ['afn-unsellable', 'unsellable', '不可售']);

  const stats = useMemo(() => {
    const skuCount = new Set(data.map((r) => r[skuCol || ''])).size || data.length;
    const totalAvailable = data.reduce((s, r) => s + toNum(r[availableCol || '']), 0);
    const lowStock = data.filter((r) => {
      const qty = toNum(r[availableCol || '']);
      return qty > 0 && qty < 30;
    }).length;
    const totalUnsellable = data.reduce((s, r) => s + toNum(r[unsellableCol || '']), 0);
    return { skuCount, totalAvailable, lowStock, totalUnsellable };
  }, [data, skuCol, availableCol, unsellableCol]);

  const chartOption = useMemo(() => {
    const available = data.reduce((s, r) => s + toNum(r[availableCol || '']), 0);
    const inbound = data.reduce((s, r) => s + toNum(r[inboundCol || '']), 0);
    const reserved = data.reduce((s, r) => s + toNum(r[reservedCol || '']), 0);
    const unsellable = data.reduce((s, r) => s + toNum(r[unsellableCol || '']), 0);
    if (available + inbound + reserved + unsellable === 0) return null;
    return {
      title: { text: '库存状态分布', left: 'center', textStyle: { fontSize: 14 } },
      tooltip: { trigger: 'item' as const },
      series: [{
        type: 'pie' as const,
        radius: ['40%', '70%'],
        data: [
          { value: available, name: '可售', itemStyle: { color: '#52c41a' } },
          { value: inbound, name: '入库中', itemStyle: { color: '#1677ff' } },
          { value: reserved, name: '预留', itemStyle: { color: '#faad14' } },
          { value: unsellable, name: '不可售', itemStyle: { color: '#ff4d4f' } },
        ].filter((d) => d.value > 0),
      }],
    };
  }, [data, availableCol, inboundCol, reservedCol, unsellableCol]);

  const columns = keys.slice(0, 8).map((key) => ({
    title: key, dataIndex: key, key, ellipsis: true,
    render: (v: unknown) => {
      if (availableCol && key === availableCol) {
        const n = toNum(v);
        if (n < 10) return <span style={{ color: '#ff4d4f', fontWeight: 600 }}>{String(v)}</span>;
        if (n < 30) return <span style={{ color: '#faad14', fontWeight: 600 }}>{String(v)}</span>;
      }
      return String(v ?? '');
    },
  }));

  return (
    <>
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}><Card size="small"><Statistic title="SKU 总数" value={stats.skuCount} prefix={<InboxOutlined />} /></Card></Col>
        <Col span={6}><Card size="small"><Statistic title="可售总量" value={stats.totalAvailable} valueStyle={{ color: '#52c41a' }} /></Card></Col>
        <Col span={6}><Card size="small"><Statistic title="低库存SKU" value={stats.lowStock} valueStyle={{ color: '#faad14' }} /></Card></Col>
        <Col span={6}><Card size="small"><Statistic title="不可售总量" value={stats.totalUnsellable} valueStyle={{ color: '#ff4d4f' }} /></Card></Col>
      </Row>
      {chartOption && <Card size="small" style={{ marginBottom: 24 }}><ReactECharts option={chartOption} style={{ height: 300 }} /></Card>}
      <Card title="明细数据" size="small">
        <Table dataSource={data.map((r, i) => ({ ...r, _key: i }))} columns={columns} rowKey="_key" size="small" scroll={{ x: true }} pagination={{ pageSize: 15 }} />
      </Card>
    </>
  );
}

// ─── FINANCE REPORT ─────────────────────────────────────────
function FinanceAnalysis({ data }: { data: Record<string, unknown>[] }) {
  const keys = data.length > 0 ? Object.keys(data[0]) : [];
  const revenueCol = findCol(keys, ['product sales', 'sales', 'revenue', '销售收入', '收入']);
  const feeCol = findCol(keys, ['total fees', 'fee', 'selling fees', '费用', '佣金']);
  const fbaCol = findCol(keys, ['fba fees', 'fba', 'fulfillment']);
  const refundCol = findCol(keys, ['refund', '退款', 'other-transaction']);
  const netCol = findCol(keys, ['net', 'total', '净收入', '净利润']);

  const stats = useMemo(() => {
    const totalRevenue = data.reduce((s, r) => s + Math.abs(toNum(r[revenueCol || ''])), 0);
    const totalFees = data.reduce((s, r) => s + Math.abs(toNum(r[feeCol || ''])), 0);
    const totalFba = data.reduce((s, r) => s + Math.abs(toNum(r[fbaCol || ''])), 0);
    const totalRefund = data.reduce((s, r) => s + Math.abs(toNum(r[refundCol || ''])), 0);
    const totalNet = netCol
      ? data.reduce((s, r) => s + toNum(r[netCol]), 0)
      : totalRevenue - totalFees - totalFba - totalRefund;
    return { totalRevenue, totalFees: totalFees + totalFba, totalRefund, totalNet };
  }, [data, revenueCol, feeCol, fbaCol, refundCol, netCol]);

  const chartOption = useMemo(() => {
    if (stats.totalRevenue === 0 && stats.totalFees === 0) return null;
    return {
      title: { text: '费用构成', left: 'center', textStyle: { fontSize: 14 } },
      tooltip: { trigger: 'item' as const },
      series: [{
        type: 'pie' as const,
        radius: ['40%', '70%'],
        data: [
          { value: stats.totalRevenue, name: '销售收入', itemStyle: { color: '#52c41a' } },
          { value: stats.totalFees, name: '平台费用', itemStyle: { color: '#1677ff' } },
          { value: stats.totalRefund, name: '退款', itemStyle: { color: '#ff4d4f' } },
        ].filter((d) => d.value > 0),
      }],
    };
  }, [stats]);

  const columns = keys.slice(0, 8).map((key) => ({ title: key, dataIndex: key, key, ellipsis: true }));

  return (
    <>
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}><Card size="small"><Statistic title="总收入" value={stats.totalRevenue} prefix={<DollarOutlined />} precision={2} valueStyle={{ color: '#52c41a' }} /></Card></Col>
        <Col span={6}><Card size="small"><Statistic title="总费用" value={stats.totalFees} precision={2} valueStyle={{ color: '#1677ff' }} /></Card></Col>
        <Col span={6}><Card size="small"><Statistic title="退款" value={stats.totalRefund} precision={2} valueStyle={{ color: '#ff4d4f' }} /></Card></Col>
        <Col span={6}><Card size="small"><Statistic title="净利润" value={stats.totalNet} prefix={<DollarOutlined />} precision={2} valueStyle={{ color: stats.totalNet >= 0 ? '#52c41a' : '#ff4d4f' }} /></Card></Col>
      </Row>
      {chartOption && <Card size="small" style={{ marginBottom: 24 }}><ReactECharts option={chartOption} style={{ height: 300 }} /></Card>}
      <Card title="明细数据" size="small">
        <Table dataSource={data.map((r, i) => ({ ...r, _key: i }))} columns={columns} rowKey="_key" size="small" scroll={{ x: true }} pagination={{ pageSize: 15 }} />
      </Card>
    </>
  );
}

// ─── FALLBACK ───────────────────────────────────────────────
function FallbackTable({ data }: { data: Record<string, unknown>[] }) {
  if (data.length === 0) return <Empty description="暂无数据" />;
  const keys = Object.keys(data[0]);
  const columns = keys.slice(0, 10).map((key) => ({ title: key, dataIndex: key, key, ellipsis: true }));
  return (
    <Table
      dataSource={data.map((r, i) => ({ ...r, _key: i }))}
      columns={columns}
      rowKey="_key"
      size="small"
      scroll={{ x: true }}
      pagination={{ pageSize: 20 }}
    />
  );
}

// ─── MAIN COMPONENT ─────────────────────────────────────────
export default function ReportAnalysis({ reportType, data, fileName }: Props) {
  if (!data || data.length === 0) {
    return <Empty description="暂无解析数据" />;
  }

  const title = `${fileName} · ${data.length} 条记录`;

  return (
    <div>
      <div style={{ marginBottom: 16, color: '#666', fontSize: 13 }}>{title}</div>
      {reportType === '订单报表' && <OrderAnalysis data={data} />}
      {reportType === '业务报告' && <BusinessAnalysis data={data} />}
      {reportType === '库存报告' && <InventoryAnalysis data={data} />}
      {reportType === '财务结算' && <FinanceAnalysis data={data} />}
      {!['订单报表', '业务报告', '库存报告', '财务结算'].includes(reportType) && <FallbackTable data={data} />}
    </div>
  );
}
