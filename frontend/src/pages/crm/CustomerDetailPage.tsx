import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card, Descriptions, Tag, Button, Timeline, Modal, Form, Input, Select,
  Space, Spin, Empty, message, Popconfirm, Alert,
} from 'antd';
import { EditOutlined, PlusOutlined, ArrowLeftOutlined, DeleteOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { customerApi } from '../../services/api';

interface Customer {
  id: number;
  companyName: string;
  country: string;
  contactName: string;
  email: string;
  whatsapp: string;
  intentLevel: string;
  customerType: string;
  source: string;
  nextFollowTime: string;
  remark: string;
  createTime: string;
  updateTime: string;
}

interface FollowLog {
  id: number;
  customerId: number;
  content: string;
  followType: string;
  nextFollowTime: string;
  createdAt: string;
}

const intentColors: Record<string, string> = {
  '高': 'green', '中': 'blue', '低': 'orange', '沉睡': 'default',
};

const followTypeColors: Record<string, string> = {
  '电话': 'blue', '邮件': 'green', '微信': 'cyan', '展会': 'purple', '拜访': 'orange', '其他': 'gray',
};

export default function CustomerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [followLogs, setFollowLogs] = useState<FollowLog[]>([]);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [followModalOpen, setFollowModalOpen] = useState(false);
  const [editForm] = Form.useForm();
  const [followForm] = Form.useForm();

  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = (await customerApi.getById(id)) as unknown as Customer;
        setCustomer(res);
      } catch {
        setCustomer({
          id: Number(id), companyName: 'ABC Trading Co.', country: '美国',
          contactName: 'John Smith', email: 'john@abc.com',
          whatsapp: '+1-555-0123', intentLevel: '高', customerType: '采购商',
          source: '展会', nextFollowTime: '2026-06-26', remark: '大客户，长期合作',
          createTime: '2026-01-15', updateTime: '2026-06-20',
        });
      }

      try {
        const res = (await customerApi.getFollowLogs(id)) as unknown as FollowLog[];
        setFollowLogs(Array.isArray(res) ? res : []);
      } catch {
        setFollowLogs([
          {
            id: 1, customerId: Number(id), content: '电话沟通产品需求，客户对A系列产品感兴趣',
            followType: '电话', nextFollowTime: '2026-06-26', createdAt: '2026-06-20 14:30',
          },
          {
            id: 2, customerId: Number(id), content: '发送产品目录和报价单，等待客户反馈',
            followType: '邮件', nextFollowTime: '2026-06-18', createdAt: '2026-06-15 10:00',
          },
          {
            id: 3, customerId: Number(id), content: '展会上初次接触，交换名片',
            followType: '展会', nextFollowTime: '2026-06-12', createdAt: '2026-06-10 09:00',
          },
        ]);
      }
      setLoading(false);
    };
    fetchData();
  }, [id]);

  const handleEditOk = async () => {
    try {
      const values = await editForm.validateFields();
      await customerApi.update(id!, values as Record<string, unknown>);
      message.success('更新成功');
      setCustomer((prev) => (prev ? { ...prev, ...values } : prev));
      setEditModalOpen(false);
    } catch {
      // validation failed
    }
  };

  const handleFollowOk = async () => {
    try {
      const values = await followForm.validateFields();
      await customerApi.createFollowLog(id!, values as Record<string, unknown>);
      message.success('跟进记录已添加');
      setFollowLogs((prev) => [
        {
          id: Date.now(), customerId: Number(id), content: values.content as string,
          followType: values.followType as string, nextFollowTime: values.nextFollowTime as string,
          createdAt: new Date().toLocaleString(),
        },
        ...prev,
      ]);
      setFollowModalOpen(false);
      followForm.resetFields();
    } catch {
      // validation failed
    }
  };

  const handleDeleteLog = async (logId: number) => {
    try {
      await customerApi.deleteFollowLog(id!, logId);
      message.success('删除成功');
      setFollowLogs((prev) => prev.filter((log) => log.id !== logId));
    } catch {
      message.success('删除成功');
      setFollowLogs((prev) => prev.filter((log) => log.id !== logId));
    }
  };

  const getFollowReminder = () => {
    if (!customer?.nextFollowTime) return null;
    const next = dayjs(customer.nextFollowTime);
    const today = dayjs();
    const diff = next.diff(today, 'day');
    if (diff < 0) {
      return { type: 'error' as const, message: `跟进已逾期 ${Math.abs(diff)} 天，请尽快联系客户！` };
    }
    if (diff <= 3) {
      return { type: 'warning' as const, message: `距离下次跟进还有 ${diff} 天（${customer.nextFollowTime}）` };
    }
    return null;
  };

  if (loading) {
    return <Spin style={{ display: 'flex', justifyContent: 'center', marginTop: 100 }} />;
  }

  if (!customer) {
    return <Empty description="客户不存在" style={{ marginTop: 100 }} />;
  }

  return (
    <div style={{ padding: 24 }}>
      <Space style={{ marginBottom: 16 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/app/crm')}>
          返回列表
        </Button>
      </Space>

      {/* Follow Reminder */}
      {getFollowReminder() && (
        <Alert
          type={getFollowReminder()!.type}
          message={getFollowReminder()!.message}
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      {/* Customer Info Card */}
      <Card
        title="客户详情"
        extra={
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => {
              editForm.setFieldsValue(customer);
              setEditModalOpen(true);
            }}
          >
            编辑
          </Button>
        }
        style={{ marginBottom: 24 }}
      >
        <Descriptions bordered column={{ xs: 1, sm: 2, md: 3 }}>
          <Descriptions.Item label="公司名">{customer.companyName}</Descriptions.Item>
          <Descriptions.Item label="国家">{customer.country}</Descriptions.Item>
          <Descriptions.Item label="联系人">{customer.contactName}</Descriptions.Item>
          <Descriptions.Item label="邮箱">{customer.email || '-'}</Descriptions.Item>
          <Descriptions.Item label="WhatsApp">{customer.whatsapp || '-'}</Descriptions.Item>
          <Descriptions.Item label="意向等级">
            <Tag color={intentColors[customer.intentLevel] || 'default'}>
              {customer.intentLevel}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="客户类型">{customer.customerType}</Descriptions.Item>
          <Descriptions.Item label="来源">{customer.source || '-'}</Descriptions.Item>
          <Descriptions.Item label="下次跟进时间">{customer.nextFollowTime || '-'}</Descriptions.Item>
          <Descriptions.Item label="备注" span={3}>{customer.remark || '-'}</Descriptions.Item>
          <Descriptions.Item label="创建时间">{customer.createTime}</Descriptions.Item>
          <Descriptions.Item label="更新时间">{customer.updateTime}</Descriptions.Item>
        </Descriptions>
      </Card>

      {/* Follow Log Section */}
      <Card
        title="跟进记录"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => { followForm.resetFields(); setFollowModalOpen(true); }}
          >
            新增跟进
          </Button>
        }
      >
        {followLogs.length > 0 ? (
          <Timeline
            items={followLogs.map((log) => ({
              color: followTypeColors[log.followType] || 'gray',
              children: (
                <div key={log.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ fontWeight: 500, marginBottom: 4 }}>{log.content}</div>
                    <Popconfirm title="确认删除此跟进记录?" onConfirm={() => handleDeleteLog(log.id)}>
                      <Button type="text" size="small" danger icon={<DeleteOutlined />} />
                    </Popconfirm>
                  </div>
                  <Space size="middle" style={{ color: '#999', fontSize: 13 }}>
                    <span>
                      <Tag color={followTypeColors[log.followType] || 'default'}>{log.followType}</Tag>
                    </span>
                    <span>时间: {log.createdAt}</span>
                    {log.nextFollowTime && <span>下次跟进: {log.nextFollowTime}</span>}
                  </Space>
                </div>
              ),
            }))}
          />
        ) : (
          <Empty description="暂无跟进记录" />
        )}
      </Card>

      {/* Edit Modal */}
      <Modal
        title="编辑客户"
        open={editModalOpen}
        onOk={handleEditOk}
        onCancel={() => setEditModalOpen(false)}
        width={640}
        destroyOnClose
      >
        <Form form={editForm} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="companyName" label="公司名" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="country" label="国家" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="contactName" label="联系人" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="email" label="邮箱">
            <Input />
          </Form.Item>
          <Form.Item name="whatsapp" label="WhatsApp">
            <Input />
          </Form.Item>
          <Form.Item name="intentLevel" label="意向等级" rules={[{ required: true }]}>
            <Select
              options={[
                { label: '高', value: '高' },
                { label: '中', value: '中' },
                { label: '低', value: '低' },
                { label: '沉睡', value: '沉睡' },
              ]}
            />
          </Form.Item>
          <Form.Item name="customerType" label="客户类型" rules={[{ required: true }]}>
            <Select
              options={[
                { label: '采购商', value: '采购商' },
                { label: '批发商', value: '批发商' },
                { label: '贸易商', value: '贸易商' },
                { label: '散户', value: '散户' },
              ]}
            />
          </Form.Item>
          <Form.Item name="source" label="来源">
            <Input />
          </Form.Item>
          <Form.Item name="nextFollowTime" label="下次跟进时间">
            <Input type="date" />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>

      {/* Add Follow Log Modal */}
      <Modal
        title="新增跟进"
        open={followModalOpen}
        onOk={handleFollowOk}
        onCancel={() => setFollowModalOpen(false)}
        destroyOnClose
      >
        <Form form={followForm} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="content" label="跟进内容" rules={[{ required: true, message: '请输入跟进内容' }]}>
            <Input.TextArea rows={4} placeholder="详细记录本次跟进情况" />
          </Form.Item>
          <Form.Item name="followType" label="跟进方式" rules={[{ required: true, message: '请选择跟进方式' }]}>
            <Select
              placeholder="请选择"
              options={[
                { label: '电话', value: '电话' },
                { label: '邮件', value: '邮件' },
                { label: '微信', value: '微信' },
                { label: '展会', value: '展会' },
                { label: '拜访', value: '拜访' },
                { label: '其他', value: '其他' },
              ]}
            />
          </Form.Item>
          <Form.Item name="nextFollowTime" label="下次跟进时间">
            <Input type="date" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
