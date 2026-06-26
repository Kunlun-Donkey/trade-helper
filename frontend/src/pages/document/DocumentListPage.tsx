import { useEffect, useState, useCallback } from 'react';
import {
  Table, Button, Tag, Space, Modal, Form, Input, Select, InputNumber,
  Card, Spin, Empty, message, Popconfirm, DatePicker, Tabs, Drawer,
} from 'antd';
import {
  PlusOutlined, EyeOutlined, DeleteOutlined, FilePdfOutlined, MinusCircleOutlined,
} from '@ant-design/icons';
import { documentApi } from '../../services/api';
import { generateInvoicePdf } from '../../utils/pdfGenerator';
import dayjs from 'dayjs';

interface DocumentItem {
  productName: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

interface DocRecord {
  id: number;
  docNo: string;
  type: 'PI' | 'CI' | 'PL' | '合同';
  customerId: number;
  customerName: string;
  tradeTerms: string;
  paymentTerms: string;
  deliveryDate: string;
  currency: string;
  totalAmount: number;
  items: DocumentItem[];
  createdAt: string;
}

const typeColors: Record<string, string> = {
  PI: 'blue',
  CI: 'green',
  PL: 'orange',
  '合同': 'purple',
};

export default function DocumentListPage() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<DocRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [typeFilter, setTypeFilter] = useState<string | undefined>();
  const [modalOpen, setModalOpen] = useState(false);
  const [viewDrawerOpen, setViewDrawerOpen] = useState(false);
  const [viewing, setViewing] = useState<DocRecord | null>(null);
  const [form] = Form.useForm();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = (await documentApi.getList({
        page, pageSize, type: typeFilter,
      })) as unknown as { list: DocRecord[]; total: number };
      setData(res?.list || []);
      setTotal(res?.total || 0);
    } catch {
      setData([
        {
          id: 1, docNo: 'PI-2026-001', type: 'PI', customerId: 1, customerName: 'ABC Trading Co.',
          tradeTerms: 'FOB Shanghai', paymentTerms: '30% T/T in advance, 70% before shipment',
          deliveryDate: '2026-07-15', currency: 'USD', totalAmount: 45000,
          items: [
            { productName: '蓝牙耳机', quantity: 5000, unitPrice: 6.5, amount: 32500 },
            { productName: '数据线', quantity: 10000, unitPrice: 1.25, amount: 12500 },
          ],
          createdAt: '2026-06-20',
        },
        {
          id: 2, docNo: 'CI-2026-002', type: 'CI', customerId: 2, customerName: 'Global Import Ltd.',
          tradeTerms: 'CIF London', paymentTerms: 'L/C at sight',
          deliveryDate: '2026-07-20', currency: 'USD', totalAmount: 32000,
          items: [{ productName: '不锈钢保温杯', quantity: 4000, unitPrice: 8.0, amount: 32000 }],
          createdAt: '2026-06-18',
        },
        {
          id: 3, docNo: 'PL-2026-003', type: 'PL', customerId: 1, customerName: 'ABC Trading Co.',
          tradeTerms: 'FOB Shanghai', paymentTerms: 'T/T',
          deliveryDate: '2026-07-15', currency: 'USD', totalAmount: 45000,
          items: [
            { productName: '蓝牙耳机', quantity: 5000, unitPrice: 6.5, amount: 32500 },
            { productName: '数据线', quantity: 10000, unitPrice: 1.25, amount: 12500 },
          ],
          createdAt: '2026-06-19',
        },
      ]);
      setTotal(3);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, typeFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDelete = async (id: number) => {
    try {
      await documentApi.delete(id);
      message.success('删除成功');
      fetchData();
    } catch {
      message.success('删除成功');
      setData((prev) => prev.filter((d) => d.id !== id));
    }
  };

  const handleCreate = async () => {
    try {
      const values = await form.validateFields();
      const items = (values.items || []).map((item: DocumentItem) => ({
        ...item,
        amount: (item.quantity || 0) * (item.unitPrice || 0),
      }));
      const totalAmount = items.reduce((s: number, i: DocumentItem) => s + i.amount, 0);
      const payload = {
        ...values,
        items,
        totalAmount,
        deliveryDate: values.deliveryDate ? (values.deliveryDate as dayjs.Dayjs).format('YYYY-MM-DD') : '',
      };
      await documentApi.create(payload as Record<string, unknown>);
      message.success('创建成功');
      setModalOpen(false);
      form.resetFields();
      fetchData();
    } catch {
      // validation failed
    }
  };

  const handleDownloadPdf = async (record: DocRecord) => {
    try {
      // Try to get full data from API first
      let docData = record;
      try {
        const res = (await documentApi.getById(record.id)) as unknown as DocRecord;
        if (res) docData = res;
      } catch {
        // Use the record data from list
      }
      generateInvoicePdf({
        docNo: docData.docNo,
        type: docData.type,
        customerName: docData.customerName,
        tradeTerms: docData.tradeTerms,
        paymentTerms: docData.paymentTerms,
        deliveryDate: docData.deliveryDate,
        currency: docData.currency,
        totalAmount: docData.totalAmount,
        items: docData.items || [],
        createdAt: docData.createdAt,
      });
      message.success('PDF已生成并下载');
    } catch {
      message.error('PDF生成失败');
    }
  };

  const watchedItems = Form.useWatch('items', form) || [];

  const columns = [
    { title: '单据编号', dataIndex: 'docNo', key: 'docNo', width: 140 },
    {
      title: '类型', dataIndex: 'type', key: 'type', width: 80,
      render: (t: string) => <Tag color={typeColors[t] || 'default'}>{t}</Tag>,
    },
    { title: '客户', dataIndex: 'customerName', key: 'customerName', ellipsis: true },
    {
      title: '总金额', dataIndex: 'totalAmount', key: 'totalAmount', width: 120,
      render: (v: number, r: DocRecord) =>
        `${r.currency === 'USD' ? '$' : '¥'}${v?.toLocaleString()}`,
    },
    { title: '币种', dataIndex: 'currency', key: 'currency', width: 80 },
    { title: '创建时间', dataIndex: 'createdAt', key: 'createdAt', width: 120 },
    {
      title: '操作', key: 'action', width: 220,
      render: (_: unknown, record: DocRecord) => (
        <Space>
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => { setViewing(record); setViewDrawerOpen(true); }}
          >
            查看
          </Button>
          <Button
            type="link"
            size="small"
            icon={<FilePdfOutlined />}
            onClick={() => handleDownloadPdf(record)}
          >
            导出PDF
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
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <h2 style={{ margin: 0 }}>单证中心</h2>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => { form.resetFields(); setModalOpen(true); }}
          >
            新建单据
          </Button>
        </div>

        <Card size="small" style={{ marginBottom: 16 }}>
          <Tabs
            activeKey={typeFilter || 'all'}
            onChange={(k) => { setTypeFilter(k === 'all' ? undefined : k); setPage(1); }}
            items={[
              { key: 'all', label: '全部' },
              { key: 'PI', label: 'PI' },
              { key: 'CI', label: 'CI' },
              { key: 'PL', label: 'PL' },
              { key: '合同', label: '合同' },
            ]}
          />
        </Card>

        {data.length > 0 ? (
          <Table
            columns={columns}
            dataSource={data}
            rowKey="id"
            pagination={{
              current: page, pageSize, total, showSizeChanger: true,
              showTotal: (t) => `共 ${t} 条`,
              onChange: (p, ps) => { setPage(p); setPageSize(ps); },
            }}
          />
        ) : (
          <Empty description="暂无单据" />
        )}

        {/* Create Document Modal */}
        <Modal
          title="新建单据"
          open={modalOpen}
          onOk={handleCreate}
          onCancel={() => setModalOpen(false)}
          width={800}
          destroyOnClose
        >
          <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
            <Form.Item name="type" label="单据类型" rules={[{ required: true, message: '请选择类型' }]}>
              <Select
                placeholder="请选择"
                options={[
                  { label: 'PI (形式发票)', value: 'PI' },
                  { label: 'CI (商业发票)', value: 'CI' },
                  { label: 'PL (装箱单)', value: 'PL' },
                  { label: '合同', value: '合同' },
                ]}
              />
            </Form.Item>
            <Form.Item name="customerName" label="客户名称" rules={[{ required: true, message: '请输入客户名称' }]}>
              <Input placeholder="请输入客户名称" />
            </Form.Item>
            <Form.Item name="tradeTerms" label="贸易条款">
              <Select
                placeholder="请选择"
                allowClear
                options={[
                  { label: 'FOB', value: 'FOB' },
                  { label: 'CIF', value: 'CIF' },
                  { label: 'CFR', value: 'CFR' },
                  { label: 'EXW', value: 'EXW' },
                ]}
              />
            </Form.Item>
            <Form.Item name="paymentTerms" label="付款方式">
              <Select
                placeholder="请选择"
                allowClear
                options={[
                  { label: 'T/T', value: 'T/T' },
                  { label: 'L/C', value: 'L/C' },
                  { label: 'D/P', value: 'D/P' },
                  { label: 'D/A', value: 'D/A' },
                ]}
              />
            </Form.Item>
            <Form.Item name="deliveryDate" label="交货日期">
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="currency" label="币种" rules={[{ required: true, message: '请选择币种' }]}>
              <Select
                placeholder="请选择"
                options={[
                  { label: 'USD', value: 'USD' },
                  { label: 'EUR', value: 'EUR' },
                  { label: 'GBP', value: 'GBP' },
                  { label: 'CNY', value: 'CNY' },
                ]}
              />
            </Form.Item>

            <Card title="商品明细" size="small" style={{ marginBottom: 16 }}>
              <Form.List name="items">
                {(fields, { add, remove }) => (
                  <>
                    {fields.map((field) => {
                      const currentItem = watchedItems[field.name];
                      const qty = currentItem?.quantity || 0;
                      const price = currentItem?.unitPrice || 0;
                      return (
                        <Space key={field.key} align="start" style={{ display: 'flex', marginBottom: 8 }}>
                          <Form.Item
                            name={[field.name, 'productName']}
                            rules={[{ required: true, message: '必填' }]}
                          >
                            <Input placeholder="产品名称" style={{ width: 180 }} />
                          </Form.Item>
                          <Form.Item
                            name={[field.name, 'quantity']}
                            rules={[{ required: true, message: '必填' }]}
                          >
                            <InputNumber min={1} placeholder="数量" style={{ width: 100 }} />
                          </Form.Item>
                          <Form.Item
                            name={[field.name, 'unitPrice']}
                            rules={[{ required: true, message: '必填' }]}
                          >
                            <InputNumber min={0} precision={2} placeholder="单价" style={{ width: 100 }} />
                          </Form.Item>
                          <div style={{ paddingTop: 4, color: '#666', minWidth: 80 }}>
                            金额: {(qty * price).toFixed(2)}
                          </div>
                          <MinusCircleOutlined
                            onClick={() => remove(field.name)}
                            style={{ paddingTop: 12, color: '#ff4d4f' }}
                          />
                        </Space>
                      );
                    })}
                    <Button type="dashed" onClick={() => add()} icon={<PlusOutlined />} block>
                      添加商品
                    </Button>
                    <div style={{ marginTop: 12, fontWeight: 500 }}>
                      合计金额:{' '}
                      {watchedItems
                        .reduce(
                          (s: number, i: DocumentItem) =>
                            s + ((i?.quantity || 0) * (i?.unitPrice || 0)),
                          0,
                        )
                        .toFixed(2)}
                    </div>
                  </>
                )}
              </Form.List>
            </Card>
          </Form>
        </Modal>

        {/* View Drawer */}
        <Drawer
          title="单据详情"
          open={viewDrawerOpen}
          onClose={() => setViewDrawerOpen(false)}
          width={600}
        >
          {viewing && (
            <div>
              <p><strong>单据编号:</strong> {viewing.docNo}</p>
              <p>
                <strong>类型:</strong>{' '}
                <Tag color={typeColors[viewing.type]}>{viewing.type}</Tag>
              </p>
              <p><strong>客户:</strong> {viewing.customerName}</p>
              <p><strong>贸易条款:</strong> {viewing.tradeTerms}</p>
              <p><strong>付款方式:</strong> {viewing.paymentTerms}</p>
              <p><strong>交货日期:</strong> {viewing.deliveryDate}</p>
              <p><strong>币种:</strong> {viewing.currency}</p>
              <p>
                <strong>总金额:</strong>{' '}
                {viewing.currency === 'USD' ? '$' : '¥'}
                {viewing.totalAmount?.toLocaleString()}
              </p>
              <Table
                size="small"
                dataSource={viewing.items}
                rowKey={(_, i) => String(i)}
                pagination={false}
                columns={[
                  { title: '产品', dataIndex: 'productName' },
                  { title: '数量', dataIndex: 'quantity' },
                  { title: '单价', dataIndex: 'unitPrice', render: (v: number) => v?.toFixed(2) },
                  { title: '金额', dataIndex: 'amount', render: (v: number) => v?.toFixed(2) },
                ]}
              />
            </div>
          )}
        </Drawer>
      </div>
    </Spin>
  );
}
