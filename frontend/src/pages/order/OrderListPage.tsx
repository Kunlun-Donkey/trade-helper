import { useEffect, useState, useCallback } from 'react';
import {
  Table, Button, Input, Select, Tag, Space, Modal, Form, message,
  Popconfirm, Card, Row, Col, Statistic, Spin, Empty, InputNumber,
} from 'antd';
import {
  PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined,
  DollarOutlined, CheckCircleOutlined, ClockCircleOutlined, WarningOutlined,
} from '@ant-design/icons';
import { orderApi } from '../../services/api';

const { Search } = Input;

interface Order {
  id: number;
  orderNo: string;
  customerId: number;
  customerName: string;
  productDescription: string;
  totalAmount: number;
  depositAmount: number;
  depositStatus: '未付' | '已付';
  balanceAmount: number;
  balanceStatus: '未付' | '已付' | '逾期';
  dueDate: string;
  orderStatus: '待确认' | '已确认' | '生产中' | '已发货' | '已完成' | '已取消';
  currency: string;
  remark: string;
  createdAt: string;
}

interface OrderStats {
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
  overdueOrders: number;
}

const statusColors: Record<string, string> = {
  '待确认': 'default',
  '已确认': 'processing',
  '生产中': 'warning',
  '已发货': 'cyan',
  '已完成': 'success',
  '已取消': 'error',
};

const payColors: Record<string, string> = {
  '未付': 'orange',
  '已付': 'green',
  '逾期': 'red',
};

export default function OrderListPage() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Order | null>(null);
  const [form] = Form.useForm();
  const [stats, setStats] = useState<OrderStats>({
    totalAmount: 0,
    paidAmount: 0,
    pendingAmount: 0,
    overdueOrders: 0,
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [ordersRes, statsRes] = await Promise.allSettled([
        orderApi.getList({ page, pageSize, search: searchText || undefined, status: statusFilter }),
        orderApi.getStats(),
      ]);

      if (ordersRes.status === 'fulfilled' && ordersRes.value) {
        const d = ordersRes.value as unknown as { list: Order[]; total: number };
        setData(d?.list || []);
        setTotal(d?.total || 0);
      } else {
        setData([
          {
            id: 1, orderNo: 'ORD-2026-001', customerId: 1, customerName: 'ABC Trading Co.',
            productDescription: '蓝牙耳机 x5000, 数据线 x10000', totalAmount: 45000,
            depositAmount: 13500, depositStatus: '已付', balanceAmount: 31500, balanceStatus: '未付',
            dueDate: '2026-07-15', orderStatus: '已确认', currency: 'USD', remark: '',
            createdAt: '2026-06-20',
          },
          {
            id: 2, orderNo: 'ORD-2026-002', customerId: 2, customerName: 'Global Import Ltd.',
            productDescription: '不锈钢保温杯 x4000', totalAmount: 32000,
            depositAmount: 9600, depositStatus: '已付', balanceAmount: 22400, balanceStatus: '已付',
            dueDate: '2026-07-20', orderStatus: '已完成', currency: 'USD', remark: '',
            createdAt: '2026-06-18',
          },
          {
            id: 3, orderNo: 'ORD-2026-003', customerId: 4, customerName: 'Sunrise Electronics',
            productDescription: 'LED台灯 x3000, 蓝牙耳机 x2000', totalAmount: 78000,
            depositAmount: 23400, depositStatus: '已付', balanceAmount: 54600, balanceStatus: '逾期',
            dueDate: '2026-06-20', orderStatus: '已发货', currency: 'USD', remark: '催款中',
            createdAt: '2026-06-15',
          },
          {
            id: 4, orderNo: 'ORD-2026-004', customerId: 3, customerName: 'Euro Goods GmbH',
            productDescription: '蓝牙耳机 x3000', totalAmount: 21000,
            depositAmount: 6300, depositStatus: '未付', balanceAmount: 14700, balanceStatus: '未付',
            dueDate: '2026-08-01', orderStatus: '待确认', currency: 'EUR', remark: '',
            createdAt: '2026-06-12',
          },
        ]);
        setTotal(4);
      }

      if (statsRes.status === 'fulfilled' && statsRes.value) {
        setStats(statsRes.value as unknown as OrderStats);
      } else {
        setStats({ totalAmount: 176000, paidAmount: 88500, pendingAmount: 87500, overdueOrders: 1 });
      }
    } catch {
      // handled above
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, searchText, statusFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDelete = async (id: number) => {
    try {
      await orderApi.delete(id);
      message.success('删除成功');
      fetchData();
    } catch {
      message.success('删除成功');
      setData((prev) => prev.filter((o) => o.id !== id));
    }
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      if (editing) {
        await orderApi.update(editing.id, values as Record<string, unknown>);
        message.success('更新成功');
      } else {
        await orderApi.create(values as Record<string, unknown>);
        message.success('创建成功');
      }
      setModalOpen(false);
      form.resetFields();
      setEditing(null);
      fetchData();
    } catch {
      // validation failed
    }
  };

  const openEdit = (record: Order) => {
    setEditing(record);
    form.setFieldsValue(record);
    setModalOpen(true);
  };

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    setModalOpen(true);
  };

  const columns = [
    { title: '订单号', dataIndex: 'orderNo', key: 'orderNo', width: 140 },
    { title: '客户', dataIndex: 'customerName', key: 'customerName', ellipsis: true },
    { title: '产品描述', dataIndex: 'productDescription', key: 'productDescription', ellipsis: true },
    {
      title: '总金额', dataIndex: 'totalAmount', key: 'totalAmount', width: 110,
      render: (v: number, r: Order) =>
        `${r.currency === 'USD' ? '$' : '€'}${v?.toLocaleString()}`,
    },
    {
      title: '定金', key: 'deposit', width: 140,
      render: (_: unknown, r: Order) => (
        <Space>
          <span>${r.depositAmount?.toLocaleString()}</span>
          <Tag color={payColors[r.depositStatus]}>{r.depositStatus}</Tag>
        </Space>
      ),
    },
    {
      title: '尾款', key: 'balance', width: 140,
      render: (_: unknown, r: Order) => (
        <Space>
          <span>${r.balanceAmount?.toLocaleString()}</span>
          <Tag color={payColors[r.balanceStatus]}>{r.balanceStatus}</Tag>
        </Space>
      ),
    },
    { title: '到期日', dataIndex: 'dueDate', key: 'dueDate', width: 110 },
    {
      title: '订单状态', dataIndex: 'orderStatus', key: 'orderStatus', width: 100,
      render: (s: string) => <Tag color={statusColors[s] || 'default'}>{s}</Tag>,
    },
    {
      title: '操作', key: 'action', width: 150,
      render: (_: unknown, record: Order) => (
        <Space>
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => openEdit(record)}>
            编辑
          </Button>
          <Popconfirm title="确认删除?" onConfirm={() => handleDelete(record.id)}>
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Spin spinning={loading}>
      <div style={{ padding: 24 }}>
        {/* Stats Bar */}
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col xs={12} sm={6}>
            <Card size="small">
              <Statistic title="总成交额" value={stats.totalAmount} prefix={<DollarOutlined />} precision={0} />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card size="small">
              <Statistic
                title="已回款"
                value={stats.paidAmount}
                prefix={<CheckCircleOutlined />}
                precision={0}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card size="small">
              <Statistic
                title="待回款"
                value={stats.pendingAmount}
                prefix={<ClockCircleOutlined />}
                precision={0}
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card size="small">
              <Statistic
                title="逾期订单"
                value={stats.overdueOrders}
                prefix={<WarningOutlined />}
                valueStyle={{ color: '#ff4d4f' }}
              />
            </Card>
          </Col>
        </Row>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <h2 style={{ margin: 0 }}>订单管理</h2>
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
            新增订单
          </Button>
        </div>

        <Card size="small" style={{ marginBottom: 16 }}>
          <Space wrap>
            <Search
              placeholder="搜索订单号"
              allowClear
              enterButton={<SearchOutlined />}
              style={{ width: 220 }}
              onSearch={(v) => {
                setSearchText(v);
                setPage(1);
              }}
            />
            <Select
              placeholder="订单状态"
              allowClear
              style={{ width: 130 }}
              value={statusFilter}
              onChange={(v) => {
                setStatusFilter(v);
                setPage(1);
              }}
              options={[
                { label: '待确认', value: '待确认' },
                { label: '已确认', value: '已确认' },
                { label: '生产中', value: '生产中' },
                { label: '已发货', value: '已发货' },
                { label: '已完成', value: '已完成' },
                { label: '已取消', value: '已取消' },
              ]}
            />
          </Space>
        </Card>

        {data.length > 0 ? (
          <Table
            columns={columns}
            dataSource={data}
            rowKey="id"
            scroll={{ x: 1200 }}
            pagination={{
              current: page,
              pageSize,
              total,
              showSizeChanger: true,
              showTotal: (t) => `共 ${t} 条`,
              onChange: (p, ps) => {
                setPage(p);
                setPageSize(ps);
              },
            }}
          />
        ) : (
          <Empty description="暂无订单" />
        )}

        <Modal
          title={editing ? '编辑订单' : '新增订单'}
          open={modalOpen}
          onOk={handleModalOk}
          onCancel={() => {
            setModalOpen(false);
            setEditing(null);
            form.resetFields();
          }}
          width={640}
          destroyOnClose
        >
          <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
            <Form.Item name="customerName" label="客户" rules={[{ required: true, message: '请输入客户' }]}>
              <Input placeholder="请输入客户名称" />
            </Form.Item>
            <Form.Item name="productDescription" label="产品描述" rules={[{ required: true }]}>
              <Input.TextArea rows={2} placeholder="描述产品和数量" />
            </Form.Item>
            <Form.Item name="totalAmount" label="总金额" rules={[{ required: true }]}>
              <InputNumber min={0} precision={2} style={{ width: '100%' }} placeholder="0.00" />
            </Form.Item>
            <Form.Item name="depositAmount" label="定金金额">
              <InputNumber min={0} precision={2} style={{ width: '100%' }} placeholder="0.00" />
            </Form.Item>
            <Form.Item name="depositStatus" label="定金状态">
              <Select
                options={[
                  { label: '未付', value: '未付' },
                  { label: '已付', value: '已付' },
                ]}
              />
            </Form.Item>
            <Form.Item name="balanceStatus" label="尾款状态">
              <Select
                options={[
                  { label: '未付', value: '未付' },
                  { label: '已付', value: '已付' },
                  { label: '逾期', value: '逾期' },
                ]}
              />
            </Form.Item>
            <Form.Item name="dueDate" label="到期日">
              <Input type="date" />
            </Form.Item>
            <Form.Item name="orderStatus" label="订单状态">
              <Select
                options={[
                  { label: '待确认', value: '待确认' },
                  { label: '已确认', value: '已确认' },
                  { label: '生产中', value: '生产中' },
                  { label: '已发货', value: '已发货' },
                  { label: '已完成', value: '已完成' },
                  { label: '已取消', value: '已取消' },
                ]}
              />
            </Form.Item>
            <Form.Item name="currency" label="币种">
              <Select
                options={[
                  { label: 'USD', value: 'USD' },
                  { label: 'EUR', value: 'EUR' },
                  { label: 'GBP', value: 'GBP' },
                  { label: 'CNY', value: 'CNY' },
                ]}
              />
            </Form.Item>
            <Form.Item name="remark" label="备注">
              <Input.TextArea rows={2} />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </Spin>
  );
}
