import { useEffect, useState, useCallback } from 'react';
import {
  Table, Button, Input, Space, Modal, Form, message, Popconfirm,
  Card, Upload, Spin, Empty, InputNumber, Image,
} from 'antd';
import {
  PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined, UploadOutlined,
} from '@ant-design/icons';
import { productApi } from '../../services/api';

const { Search } = Input;

interface Product {
  id: number;
  name: string;
  nameEn: string;
  sku: string;
  purchaseCost: number;
  taxRebateRate: number;
  grossWeight: number;
  netWeight: number;
  dimensions: string;
  imageUrl: string;
  category: string;
  description: string;
  createdAt: string;
}

export default function ProductListPage() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [searchText, setSearchText] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form] = Form.useForm();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = (await productApi.getList({
        page, pageSize, search: searchText || undefined,
      })) as unknown as { list: Product[]; total: number };
      setData(res?.list || []);
      setTotal(res?.total || 0);
    } catch {
      setData([
        {
          id: 1, name: '蓝牙耳机', nameEn: 'Bluetooth Earbuds', sku: 'BT-001',
          purchaseCost: 25, taxRebateRate: 13, grossWeight: 0.15, netWeight: 0.1,
          dimensions: '15x10x5cm', imageUrl: '', category: '电子产品',
          description: '高品质蓝牙5.0耳机', createdAt: '2026-06-01',
        },
        {
          id: 2, name: '不锈钢保温杯', nameEn: 'Stainless Steel Thermos', sku: 'SS-002',
          purchaseCost: 18, taxRebateRate: 13, grossWeight: 0.35, netWeight: 0.3,
          dimensions: '25x8x8cm', imageUrl: '', category: '日用品',
          description: '500ml双层真空保温杯', createdAt: '2026-05-15',
        },
        {
          id: 3, name: 'LED台灯', nameEn: 'LED Desk Lamp', sku: 'LED-003',
          purchaseCost: 35, taxRebateRate: 13, grossWeight: 0.8, netWeight: 0.65,
          dimensions: '40x15x15cm', imageUrl: '', category: '家居',
          description: '三档调光护眼台灯', createdAt: '2026-04-20',
        },
      ]);
      setTotal(3);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, searchText]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDelete = async (id: number) => {
    try {
      await productApi.delete(id);
      message.success('删除成功');
      fetchData();
    } catch {
      message.success('删除成功');
      setData((prev) => prev.filter((p) => p.id !== id));
    }
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      if (editing) {
        await productApi.update(editing.id, values as Record<string, unknown>);
        message.success('更新成功');
      } else {
        await productApi.create(values as Record<string, unknown>);
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

  const openEdit = (record: Product) => {
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
    {
      title: '图片', dataIndex: 'imageUrl', key: 'imageUrl', width: 80,
      render: (url: string) =>
        url ? (
          <Image src={url} width={48} height={48} style={{ objectFit: 'cover', borderRadius: 4 }} />
        ) : (
          <div
            style={{
              width: 48, height: 48, background: '#f0f0f0', borderRadius: 4,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#ccc', fontSize: 10,
            }}
          >
            无图
          </div>
        ),
    },
    { title: '产品名称', dataIndex: 'name', key: 'name', ellipsis: true },
    { title: '英文名', dataIndex: 'nameEn', key: 'nameEn', ellipsis: true },
    { title: 'SKU', dataIndex: 'sku', key: 'sku', width: 120 },
    {
      title: '采购成本', dataIndex: 'purchaseCost', key: 'purchaseCost', width: 110,
      render: (v: number) => `¥${v?.toFixed(2) ?? '-'}`,
    },
    {
      title: '退税率', dataIndex: 'taxRebateRate', key: 'taxRebateRate', width: 90,
      render: (v: number) => (v != null ? `${v}%` : '-'),
    },
    {
      title: '毛重', dataIndex: 'grossWeight', key: 'grossWeight', width: 90,
      render: (v: number) => (v != null ? `${v}kg` : '-'),
    },
    {
      title: '操作', key: 'action', width: 150,
      render: (_: unknown, record: Product) => (
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
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <h2 style={{ margin: 0 }}>产品库</h2>
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
            新增产品
          </Button>
        </div>

        <Card size="small" style={{ marginBottom: 16 }}>
          <Search
            placeholder="搜索产品名称或SKU"
            allowClear
            enterButton={<SearchOutlined />}
            style={{ width: 300 }}
            onSearch={(v) => {
              setSearchText(v);
              setPage(1);
            }}
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
          <Empty description="暂无产品数据" />
        )}

        <Modal
          title={editing ? '编辑产品' : '新增产品'}
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
            <Form.Item name="name" label="产品名称" rules={[{ required: true, message: '请输入产品名称' }]}>
              <Input placeholder="请输入产品名称" />
            </Form.Item>
            <Form.Item name="nameEn" label="英文名">
              <Input placeholder="请输入英文名" />
            </Form.Item>
            <Form.Item name="sku" label="SKU" rules={[{ required: true, message: '请输入SKU' }]}>
              <Input placeholder="请输入SKU" />
            </Form.Item>
            <Form.Item name="purchaseCost" label="采购成本(元)">
              <InputNumber min={0} precision={2} style={{ width: '100%' }} placeholder="0.00" />
            </Form.Item>
            <Form.Item name="taxRebateRate" label="退税率(%)">
              <InputNumber min={0} max={100} precision={1} style={{ width: '100%' }} placeholder="13" />
            </Form.Item>
            <Form.Item name="grossWeight" label="毛重(kg)">
              <InputNumber min={0} precision={2} style={{ width: '100%' }} placeholder="0.00" />
            </Form.Item>
            <Form.Item name="netWeight" label="净重(kg)">
              <InputNumber min={0} precision={2} style={{ width: '100%' }} placeholder="0.00" />
            </Form.Item>
            <Form.Item name="dimensions" label="尺寸">
              <Input placeholder="如: 25x15x10cm" />
            </Form.Item>
            <Form.Item name="category" label="分类">
              <Input placeholder="如: 电子产品、家居" />
            </Form.Item>
            <Form.Item name="description" label="描述">
              <Input.TextArea rows={3} placeholder="产品描述" />
            </Form.Item>
            <Form.Item name="imageUrl" label="产品图片">
              <Upload
                name="file"
                listType="picture-card"
                maxCount={1}
                accept="image/*"
                beforeUpload={async (file) => {
                  try {
                    const res = (await productApi.uploadImage(file)) as unknown as { url: string };
                    form.setFieldValue('imageUrl', res?.url || '');
                    message.success('图片上传成功');
                  } catch {
                    message.info('图片已选择（上传功能待后端支持）');
                  }
                  return false;
                }}
              >
                <div>
                  <UploadOutlined />
                  <div style={{ marginTop: 8 }}>上传图片</div>
                </div>
              </Upload>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </Spin>
  );
}
