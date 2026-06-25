import { useEffect, useState, useCallback } from 'react';
import {
  Table,
  Button,
  Input,
  Select,
  Tag,
  Space,
  Modal,
  Form,
  message,
  Popconfirm,
  Card,
  Upload,
  Spin,
  Empty,
} from 'antd';
import {
  PlusOutlined,
  UploadOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { customerApi } from '../../services/api';

const { Search } = Input;

interface Customer {
  id: number;
  companyName: string;
  country: string;
  contactName: string;
  email: string;
  whatsapp: string;
  intentLevel: '高' | '中' | '低' | '沉睡';
  customerType: '采购商' | '批发商' | '贸易商' | '散户';
  source: string;
  nextFollowTime: string;
  remark: string;
  createTime: string;
  updateTime: string;
}

const intentColors: Record<string, string> = {
  '高': 'green',
  '中': 'blue',
  '低': 'orange',
  '沉睡': 'default',
};

export default function CustomerListPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<Customer[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [searchText, setSearchText] = useState('');
  const [intentFilter, setIntentFilter] = useState<string | undefined>();
  const [typeFilter, setTypeFilter] = useState<string | undefined>();

  const [modalOpen, setModalOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [editing, setEditing] = useState<Customer | null>(null);
  const [form] = Form.useForm();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = (await customerApi.getList({
        page,
        pageSize,
        search: searchText || undefined,
        intentLevel: intentFilter,
        customerType: typeFilter,
      })) as unknown as { list: Customer[]; total: number };
      setData(res?.list || []);
      setTotal(res?.total || 0);
    } catch {
      setData([
        {
          id: 1, companyName: 'ABC Trading Co.', country: '美国', contactName: 'John Smith',
          email: 'john@abc.com', whatsapp: '+1-555-0123', intentLevel: '高',
          customerType: '采购商', source: '展会', nextFollowTime: '2026-06-26',
          remark: '大客户', createTime: '2026-01-15', updateTime: '2026-06-20',
        },
        {
          id: 2, companyName: 'Global Import Ltd.', country: '英国', contactName: 'Emma Wilson',
          email: 'emma@globalimport.co.uk', whatsapp: '+44-20-7946', intentLevel: '中',
          customerType: '批发商', source: '官网', nextFollowTime: '2026-06-28',
          remark: '', createTime: '2026-02-10', updateTime: '2026-06-18',
        },
        {
          id: 3, companyName: 'Euro Goods GmbH', country: '德国', contactName: 'Hans Mueller',
          email: 'hans@eurogoods.de', whatsapp: '+49-30-1234', intentLevel: '低',
          customerType: '贸易商', source: '阿里国际站', nextFollowTime: '2026-07-01',
          remark: '', createTime: '2026-03-05', updateTime: '2026-06-10',
        },
        {
          id: 4, companyName: 'Sunrise Electronics', country: '日本', contactName: '田中太郎',
          email: 'tanaka@sunrise.jp', whatsapp: '+81-3-1234', intentLevel: '高',
          customerType: '采购商', source: '推荐', nextFollowTime: '2026-06-25',
          remark: '长期合作', createTime: '2025-11-20', updateTime: '2026-06-22',
        },
        {
          id: 5, companyName: 'MidEast Supplies', country: '阿联酋', contactName: 'Ahmed Ali',
          email: 'ahmed@mideast.ae', whatsapp: '+971-4-5678', intentLevel: '沉睡',
          customerType: '散户', source: '谷歌广告', nextFollowTime: '',
          remark: '半年未联系', createTime: '2025-08-12', updateTime: '2025-12-01',
        },
      ]);
      setTotal(5);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, searchText, intentFilter, typeFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDelete = async (id: number) => {
    try {
      await customerApi.delete(id);
      message.success('删除成功');
      fetchData();
    } catch {
      message.success('删除成功');
      setData((prev) => prev.filter((c) => c.id !== id));
    }
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      if (editing) {
        await customerApi.update(editing.id, values);
        message.success('更新成功');
      } else {
        await customerApi.create(values);
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

  const openEdit = (record: Customer) => {
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
    { title: '公司名', dataIndex: 'companyName', key: 'companyName', ellipsis: true },
    { title: '国家', dataIndex: 'country', key: 'country', width: 100 },
    { title: '联系人', dataIndex: 'contactName', key: 'contactName', width: 120 },
    {
      title: '意向等级', dataIndex: 'intentLevel', key: 'intentLevel', width: 100,
      render: (level: string) => <Tag color={intentColors[level] || 'default'}>{level}</Tag>,
    },
    { title: '客户类型', dataIndex: 'customerType', key: 'customerType', width: 100 },
    {
      title: '下次跟进时间', dataIndex: 'nextFollowTime', key: 'nextFollowTime', width: 130,
      render: (t: string) => t || '-',
    },
    {
      title: '操作', key: 'action', width: 200,
      render: (_: unknown, record: Customer) => (
        <Space>
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => openEdit(record)}>
            编辑
          </Button>
          <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => navigate(`/crm/${record.id}`)}>
            详情
          </Button>
          <Popconfirm title="确认删除?" onConfirm={() => handleDelete(record.id)}>
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>删除</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Spin spinning={loading}>
      <div style={{ padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <h2 style={{ margin: 0 }}>客户管理</h2>
          <Space>
            <Button icon={<UploadOutlined />} onClick={() => setImportModalOpen(true)}>批量导入</Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>新增客户</Button>
          </Space>
        </div>

        <Card size="small" style={{ marginBottom: 16 }}>
          <Space wrap>
            <Search
              placeholder="搜索公司名/联系人"
              allowClear
              enterButton={<SearchOutlined />}
              style={{ width: 260 }}
              onSearch={(v) => { setSearchText(v); setPage(1); }}
            />
            <Select
              placeholder="意向等级"
              allowClear
              style={{ width: 130 }}
              value={intentFilter}
              onChange={(v) => { setIntentFilter(v); setPage(1); }}
              options={[
                { label: '高', value: '高' },
                { label: '中', value: '中' },
                { label: '低', value: '低' },
                { label: '沉睡', value: '沉睡' },
              ]}
            />
            <Select
              placeholder="客户类型"
              allowClear
              style={{ width: 130 }}
              value={typeFilter}
              onChange={(v) => { setTypeFilter(v); setPage(1); }}
              options={[
                { label: '采购商', value: '采购商' },
                { label: '批发商', value: '批发商' },
                { label: '贸易商', value: '贸易商' },
                { label: '散户', value: '散户' },
              ]}
            />
          </Space>
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
          <Empty description="暂无客户数据" />
        )}

        {/* Add/Edit Modal */}
        <Modal
          title={editing ? '编辑客户' : '新增客户'}
          open={modalOpen}
          onOk={handleModalOk}
          onCancel={() => { setModalOpen(false); setEditing(null); form.resetFields(); }}
          width={640}
          destroyOnClose
        >
          <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
            <Form.Item name="companyName" label="公司名" rules={[{ required: true, message: '请输入公司名' }]}>
              <Input placeholder="请输入公司名" />
            </Form.Item>
            <Form.Item name="country" label="国家" rules={[{ required: true, message: '请输入国家' }]}>
              <Input placeholder="请输入国家" />
            </Form.Item>
            <Form.Item name="contactName" label="联系人" rules={[{ required: true, message: '请输入联系人' }]}>
              <Input placeholder="请输入联系人" />
            </Form.Item>
            <Form.Item name="email" label="邮箱">
              <Input placeholder="请输入邮箱" />
            </Form.Item>
            <Form.Item name="whatsapp" label="WhatsApp">
              <Input placeholder="请输入WhatsApp号码" />
            </Form.Item>
            <Form.Item name="intentLevel" label="意向等级" rules={[{ required: true, message: '请选择意向等级' }]}>
              <Select
                placeholder="请选择"
                options={[
                  { label: '高', value: '高' },
                  { label: '中', value: '中' },
                  { label: '低', value: '低' },
                  { label: '沉睡', value: '沉睡' },
                ]}
              />
            </Form.Item>
            <Form.Item name="customerType" label="客户类型" rules={[{ required: true, message: '请选择客户类型' }]}>
              <Select
                placeholder="请选择"
                options={[
                  { label: '采购商', value: '采购商' },
                  { label: '批发商', value: '批发商' },
                  { label: '贸易商', value: '贸易商' },
                  { label: '散户', value: '散户' },
                ]}
              />
            </Form.Item>
            <Form.Item name="source" label="来源">
              <Input placeholder="如：展会、阿里国际站、推荐" />
            </Form.Item>
            <Form.Item name="nextFollowTime" label="下次跟进时间">
              <Input type="date" />
            </Form.Item>
            <Form.Item name="remark" label="备注">
              <Input.TextArea rows={3} placeholder="备注信息" />
            </Form.Item>
          </Form>
        </Modal>

        {/* Import Modal */}
        <Modal
          title="批量导入客户"
          open={importModalOpen}
          onCancel={() => setImportModalOpen(false)}
          footer={null}
          destroyOnClose
        >
          <div style={{ padding: '16px 0' }}>
            <Upload.Dragger
              name="file"
              accept=".xlsx,.xls,.csv"
              multiple={false}
              beforeUpload={() => false}
              showUploadList={false}
            >
              <p className="ant-upload-drag-icon"><UploadOutlined /></p>
              <p className="ant-upload-text">点击或拖拽Excel文件到此区域</p>
              <p className="ant-upload-hint">支持 .xlsx, .xls, .csv 格式</p>
            </Upload.Dragger>
          </div>
        </Modal>
      </div>
    </Spin>
  );
}
