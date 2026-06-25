import { useEffect, useState, useRef } from 'react';
import {
  Row,
  Col,
  Card,
  Statistic,
  Table,
  Tabs,
  Upload,
  Progress,
  Tag,
  List,
  Badge,
  Spin,
  Empty,
  message,
} from 'antd';
import {
  UserAddOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  DollarOutlined,
  InboxOutlined,
  BellOutlined,
  WarningOutlined,
  FileExclamationOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import gsap from 'gsap';
import { dashboardApi } from '../../services/api';
import { isAnimationsEnabled } from '../../utils/gsap';

interface DashboardStats {
  newCustomers: number;
  pendingFollowUp: number;
  monthlyDeals: number;
  pendingPayment: number;
}

interface RecentOrder {
  key: number;
  orderNo: string;
  customer: string;
  amount: number;
  status: string;
  createdAt: string;
}

interface TodoItem {
  id: number;
  type: string;
  title: string;
  description: string;
  time: string;
  urgent: boolean;
}

interface IntentData {
  label: string;
  value: number;
  color: string;
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    newCustomers: 0,
    pendingFollowUp: 0,
    monthlyDeals: 0,
    pendingPayment: 0,
  });
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [intentData, setIntentData] = useState<IntentData[]>([]);
  const [amazonStats, setAmazonStats] = useState({ sales: 0, orders: 0, refunds: 0 });
  const statsRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [b2bRes, amazonRes, todosRes] = await Promise.allSettled([
          dashboardApi.getB2BStats(),
          dashboardApi.getAmazonStats(),
          dashboardApi.getTodos(),
        ]);

        if (b2bRes.status === 'fulfilled' && b2bRes.value) {
          const b2b = b2bRes.value as Record<string, unknown>;
          setStats({
            newCustomers: (b2b.newCustomers as number) ?? 23,
            pendingFollowUp: (b2b.pendingFollowUp as number) ?? 15,
            monthlyDeals: (b2b.monthlyDeals as number) ?? 8,
            pendingPayment: (b2b.pendingPayment as number) ?? 125000,
          });
          setRecentOrders(
            (b2b.recentOrders as RecentOrder[]) ?? [
              { key: 1, orderNo: 'ORD-2026-001', customer: 'ABC Trading Co.', amount: 45000, status: '已确认', createdAt: '2026-06-20' },
              { key: 2, orderNo: 'ORD-2026-002', customer: 'Global Import Ltd.', amount: 32000, status: '生产中', createdAt: '2026-06-18' },
              { key: 3, orderNo: 'ORD-2026-003', customer: 'Sunrise Electronics', amount: 78000, status: '已发货', createdAt: '2026-06-15' },
              { key: 4, orderNo: 'ORD-2026-004', customer: 'Euro Goods GmbH', amount: 21000, status: '待确认', createdAt: '2026-06-12' },
              { key: 5, orderNo: 'ORD-2026-005', customer: 'MidEast Supplies', amount: 56000, status: '已完成', createdAt: '2026-06-10' },
            ]
          );
          setIntentData(
            (b2b.intentData as IntentData[]) ?? [
              { label: '高意向', value: 35, color: '#52c41a' },
              { label: '中意向', value: 28, color: '#1890ff' },
              { label: '低意向', value: 20, color: '#faad14' },
              { label: '沉睡', value: 17, color: '#d9d9d9' },
            ]
          );
        } else {
          setStats({ newCustomers: 23, pendingFollowUp: 15, monthlyDeals: 8, pendingPayment: 125000 });
          setRecentOrders([
            { key: 1, orderNo: 'ORD-2026-001', customer: 'ABC Trading Co.', amount: 45000, status: '已确认', createdAt: '2026-06-20' },
            { key: 2, orderNo: 'ORD-2026-002', customer: 'Global Import Ltd.', amount: 32000, status: '生产中', createdAt: '2026-06-18' },
            { key: 3, orderNo: 'ORD-2026-003', customer: 'Sunrise Electronics', amount: 78000, status: '已发货', createdAt: '2026-06-15' },
            { key: 4, orderNo: 'ORD-2026-004', customer: 'Euro Goods GmbH', amount: 21000, status: '待确认', createdAt: '2026-06-12' },
            { key: 5, orderNo: 'ORD-2026-005', customer: 'MidEast Supplies', amount: 56000, status: '已完成', createdAt: '2026-06-10' },
          ]);
          setIntentData([
            { label: '高意向', value: 35, color: '#52c41a' },
            { label: '中意向', value: 28, color: '#1890ff' },
            { label: '低意向', value: 20, color: '#faad14' },
            { label: '沉睡', value: 17, color: '#d9d9d9' },
          ]);
        }

        if (amazonRes.status === 'fulfilled' && amazonRes.value) {
          const amz = amazonRes.value as Record<string, unknown>;
          setAmazonStats({
            sales: (amz.sales as number) ?? 0,
            orders: (amz.orders as number) ?? 0,
            refunds: (amz.refunds as number) ?? 0,
          });
        } else {
          setAmazonStats({ sales: 12580.5, orders: 342, refunds: 12 });
        }

        if (todosRes.status === 'fulfilled' && todosRes.value) {
          setTodos(todosRes.value as TodoItem[]);
        } else {
          setTodos([
            { id: 1, type: 'follow', title: '跟进提醒', description: 'ABC Trading Co. 待跟进，上次联系3天前', time: '今天 14:00', urgent: true },
            { id: 2, type: 'payment', title: '逾期尾款', description: 'ORD-2026-003 尾款$12,000已逾期5天', time: '已逾期', urgent: true },
            { id: 3, type: 'quote', title: '未报价客户', description: '3位高意向客户尚未发送报价', time: '今天', urgent: false },
          ]);
        }
      } catch {
        message.error('加载数据失败');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // GSAP 入场动画
  useEffect(() => {
    if (loading || !isAnimationsEnabled()) return;
    const timer = setTimeout(() => {
      // 统计卡片入场
      if (statsRef.current) {
        const cards = statsRef.current.querySelectorAll('.ant-card');
        if (cards.length > 0) {
          gsap.fromTo(
            cards,
            { opacity: 0, y: 30, scale: 0.95 },
            { opacity: 1, y: 0, scale: 1, duration: 0.5, stagger: 0.1, ease: 'power2.out' }
          );
        }
      }
      // 数据卡片入场
      if (cardsRef.current) {
        const sections = cardsRef.current.querySelectorAll('.ant-card');
        if (sections.length > 0) {
          gsap.fromTo(
            sections,
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.4, stagger: 0.08, ease: 'power2.out', delay: 0.3 }
          );
        }
      }
    }, 200);
    return () => clearTimeout(timer);
  }, [loading]);

  const orderColumns = [
    { title: '订单号', dataIndex: 'orderNo', key: 'orderNo' },
    { title: '客户', dataIndex: 'customer', key: 'customer' },
    {
      title: '金额',
      dataIndex: 'amount',
      key: 'amount',
      render: (v: number) => `$${v.toLocaleString()}`,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (s: string) => {
        const colorMap: Record<string, string> = {
          待确认: 'default',
          已确认: 'processing',
          生产中: 'warning',
          已发货: 'cyan',
          已完成: 'success',
          已取消: 'error',
        };
        return <Tag color={colorMap[s] || 'default'}>{s}</Tag>;
      },
    },
    { title: '下单日期', dataIndex: 'createdAt', key: 'createdAt' },
  ];

  const totalIntent = intentData.reduce((s, d) => s + d.value, 0) || 1;

  const todoIcons: Record<string, React.ReactNode> = {
    follow: <ClockCircleOutlined style={{ color: '#1890ff' }} />,
    payment: <DollarOutlined style={{ color: '#ff4d4f' }} />,
    quote: <FileExclamationOutlined style={{ color: '#faad14' }} />,
  };

  return (
    <Spin spinning={loading}>
      <div data-gsap="dashboard" style={{ padding: 24 }}>
        {/* Stats Cards */}
        <Row ref={statsRef} gutter={16} data-gsap="stats-row" style={{ marginBottom: 24 }}>
          <Col xs={24} sm={12} lg={6}>
            <Card hoverable data-gsap="stat-card">
              <Statistic
                title="新增客户"
                value={stats.newCustomers}
                prefix={<UserAddOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card hoverable data-gsap="stat-card">
              <Statistic
                title="待跟进客户"
                value={stats.pendingFollowUp}
                prefix={<ClockCircleOutlined />}
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card hoverable data-gsap="stat-card">
              <Statistic
                title="本月成交"
                value={stats.monthlyDeals}
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: '#52c41a' }}
                suffix="单"
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card hoverable data-gsap="stat-card">
              <Statistic
                title="待回款金额"
                value={stats.pendingPayment}
                prefix={<DollarOutlined />}
                precision={2}
                valueStyle={{ color: '#ff4d4f' }}
              />
            </Card>
          </Col>
        </Row>

        {/* Tab Panels */}
        <div ref={cardsRef}>
        <Card data-gsap="tabs-card" style={{ marginBottom: 24 }}>
          <Tabs
            defaultActiveKey="b2b"
            items={[
              {
                key: 'b2b',
                label: 'B2B外贸看板',
                children: (
                  <Row gutter={24}>
                    <Col xs={24} lg={10}>
                      <Card title="客户意向分布" size="small">
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, justifyContent: 'center' }}>
                          {intentData.map((item) => (
                            <div key={item.label} style={{ textAlign: 'center' }}>
                              <Progress
                                type="circle"
                                percent={Math.round((item.value / totalIntent) * 100)}
                                strokeColor={item.color}
                                size={100}
                                format={() => item.value}
                              />
                              <div style={{ marginTop: 8, fontWeight: 500 }}>{item.label}</div>
                            </div>
                          ))}
                        </div>
                      </Card>
                    </Col>
                    <Col xs={24} lg={14}>
                      <Card title="最近订单" size="small">
                        {recentOrders.length > 0 ? (
                          <Table
                            columns={orderColumns}
                            dataSource={recentOrders}
                            pagination={false}
                            size="small"
                            rowKey="key"
                          />
                        ) : (
                          <Empty description="暂无订单" />
                        )}
                      </Card>
                    </Col>
                  </Row>
                ),
              },
              {
                key: 'amazon',
                label: '亚马逊看板',
                children: (
                  <>
                    <Row gutter={16} style={{ marginBottom: 16 }}>
                      <Col xs={24} sm={8}>
                        <Card size="small">
                          <Statistic
                            title="销售额"
                            value={amazonStats.sales}
                            prefix="$"
                            precision={2}
                            valueStyle={{ color: '#52c41a' }}
                          />
                        </Card>
                      </Col>
                      <Col xs={24} sm={8}>
                        <Card size="small">
                          <Statistic title="订单量" value={amazonStats.orders} />
                        </Card>
                      </Col>
                      <Col xs={24} sm={8}>
                        <Card size="small">
                          <Statistic
                            title="退款数"
                            value={amazonStats.refunds}
                            valueStyle={{ color: '#ff4d4f' }}
                          />
                        </Card>
                      </Col>
                    </Row>
                    <Card title="上传报表" size="small">
                      <Upload.Dragger
                        name="file"
                        multiple={false}
                        accept=".csv,.xlsx,.xls"
                        beforeUpload={() => false}
                        showUploadList={false}
                      >
                        <p className="ant-upload-drag-icon">
                          <InboxOutlined />
                        </p>
                        <p className="ant-upload-text">点击或拖拽CSV/Excel文件到此区域上传</p>
                        <p className="ant-upload-hint">支持 .csv, .xlsx, .xls 格式</p>
                      </Upload.Dragger>
                    </Card>
                  </>
                ),
              },
            ]}
          />
        </Card>

        {/* Todo Center */}
        <Card
          data-gsap="todo-card"
          title={
            <span>
              <BellOutlined /> 待办中心
            </span>
          }
        >
          {todos.length > 0 ? (
            <List
              dataSource={todos}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={
                      <Badge dot={item.urgent} offset={[-2, 2]}>
                        {todoIcons[item.type] || <TeamOutlined />}
                      </Badge>
                    }
                    title={item.title}
                    description={item.description}
                  />
                  <span style={{ color: item.urgent ? '#ff4d4f' : '#999', whiteSpace: 'nowrap' }}>
                    {item.urgent && <WarningOutlined style={{ marginRight: 4 }} />}
                    {item.time}
                  </span>
                </List.Item>
              )}
            />
          ) : (
            <Empty description="暂无待办事项" />
          )}
        </Card>
        </div>
      </div>
    </Spin>
  );
}
