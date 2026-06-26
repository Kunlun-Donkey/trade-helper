import { Card, Row, Col, Typography, Space, Divider, Tag, Collapse } from 'antd';
import {
  WechatOutlined,
  PhoneOutlined,
  MailOutlined,
  ClockCircleOutlined,
  QuestionCircleOutlined,
  SafetyCertificateOutlined,
  FileTextOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { usePageEnter } from '@/hooks/useGsap';

const { Title, Paragraph, Text } = Typography;
const { Panel } = Collapse;

// 服务内容
const services = [
  { icon: <FileTextOutlined />, title: '代理记账', desc: '专业会计团队，规范账务处理，按时纳税申报' },
  { icon: <SafetyCertificateOutlined />, title: '税务筹划', desc: '合理节税方案，降低企业税负，规避税务风险' },
  { icon: <TeamOutlined />, title: '工商注册', desc: '公司注册、变更、注销，一站式工商服务' },
  { icon: <FileTextOutlined />, title: '发票管理', desc: '发票开具、认证、管理，确保合规无忧' },
];

// FAQ
const faqs = [
  { q: '代账费用是多少？', a: '根据企业规模和业务量定价，小规模纳税人起步价200元/月，一般纳税人起步价500元/月，具体请咨询获取报价。' },
  { q: '需要提供哪些资料？', a: '营业执照副本、银行对账单、发票、费用单据等，首次合作会有详细资料清单。' },
  { q: '服务流程是怎样的？', a: '签约 → 资料交接 → 建账记账 → 纳税申报 → 报表反馈，全程专人对接。' },
  { q: '如何保证数据安全？', a: '签署保密协议，数据加密存储，专人专岗管理，确保企业财务信息安全。' },
  { q: '可以提供哪些报表？', a: '月度财务报表、纳税申报表、年度汇算清缴报告，以及按需提供的专项分析报告。' },
];

export default function ContactPage() {
  const pageRef = usePageEnter();

  return (
    <div ref={pageRef} style={{ padding: '40px 24px', maxWidth: 1000, margin: '0 auto' }}>
      {/* 顶部标题 */}
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <Title level={2} style={{ marginBottom: 8 }}>专业代账服务</Title>
        <Paragraph style={{ fontSize: 16, color: '#666' }}>
          专注外贸企业财税服务，让您专心做业务，账务交给我们
        </Paragraph>
      </div>

      {/* 联系方式卡片 */}
      <Row gutter={24} style={{ marginBottom: 32 }}>
        <Col xs={24} md={12}>
          <Card
            hoverable
            style={{ textAlign: 'center', height: '100%' }}
            styles={{ body: { padding: '32px 24px' } }}
          >
            <Title level={4} style={{ marginBottom: 24 }}>
              <WechatOutlined style={{ color: '#07c160', marginRight: 8 }} />
              微信扫码咨询
            </Title>
            <div
              style={{
                width: 200,
                height: 200,
                margin: '0 auto 16px',
                background: '#f5f5f5',
                borderRadius: 8,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px dashed #d9d9d9',
              }}
            >
              {/* 替换为你的微信二维码图片 */}
              <div style={{ textAlign: 'center', color: '#999' }}>
                <WechatOutlined style={{ fontSize: 48, color: '#07c160' }} />
                <div style={{ marginTop: 8, fontSize: 13 }}>微信二维码</div>
                <div style={{ fontSize: 12, color: '#bbb' }}>(请替换为实际二维码)</div>
              </div>
            </div>
            <Text type="secondary">长按或扫描二维码添加微信</Text>
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card
            hoverable
            style={{ height: '100%' }}
            styles={{ body: { padding: '32px 24px' } }}
          >
            <Title level={4} style={{ marginBottom: 24, textAlign: 'center' }}>
              联系方式
            </Title>
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{
                  width: 48, height: 48, borderRadius: '50%', background: '#e6f7ff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <PhoneOutlined style={{ fontSize: 22, color: '#1677ff' }} />
                </div>
                <div>
                  <Text type="secondary" style={{ fontSize: 13 }}>咨询电话</Text>
                  <div>
                    <a href="tel:400-123-4567" style={{ fontSize: 18, fontWeight: 600 }}>
                      400-123-4567
                    </a>
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{
                  width: 48, height: 48, borderRadius: '50%', background: '#fff7e6',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <MailOutlined style={{ fontSize: 22, color: '#fa8c16' }} />
                </div>
                <div>
                  <Text type="secondary" style={{ fontSize: 13 }}>电子邮箱</Text>
                  <div>
                    <a href="mailto:service@example.com" style={{ fontSize: 16, fontWeight: 500 }}>
                      service@example.com
                    </a>
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{
                  width: 48, height: 48, borderRadius: '50%', background: '#f6ffed',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <ClockCircleOutlined style={{ fontSize: 22, color: '#52c41a' }} />
                </div>
                <div>
                  <Text type="secondary" style={{ fontSize: 13 }}>服务时间</Text>
                  <div style={{ fontSize: 16, fontWeight: 500 }}>
                    工作日 9:00 - 18:00
                  </div>
                </div>
              </div>
            </Space>
          </Card>
        </Col>
      </Row>

      {/* 服务内容 */}
      <Divider>
        <Title level={4} style={{ margin: 0 }}>服务内容</Title>
      </Divider>
      <Row gutter={16} style={{ marginBottom: 32 }}>
        {services.map((s, i) => (
          <Col xs={12} sm={6} key={i}>
            <Card hoverable style={{ textAlign: 'center', height: '100%' }}>
              <div style={{ fontSize: 32, color: '#1677ff', marginBottom: 12 }}>{s.icon}</div>
              <Title level={5} style={{ marginBottom: 8 }}>{s.title}</Title>
              <Text type="secondary" style={{ fontSize: 13 }}>{s.desc}</Text>
            </Card>
          </Col>
        ))}
      </Row>

      {/* 优势标签 */}
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        {['10年经验', '持证会计', '一对一服务', '及时响应', '价格透明', '安全保密'].map((tag) => (
          <Tag key={tag} color="blue" style={{ margin: '4px 8px', padding: '4px 16px', fontSize: 14 }}>
            {tag}
          </Tag>
        ))}
      </div>

      {/* 常见问题 */}
      <Divider>
        <Title level={4} style={{ margin: 0 }}>
          <QuestionCircleOutlined style={{ marginRight: 8 }} />
          常见问题
        </Title>
      </Divider>
      <Collapse accordion style={{ marginBottom: 32 }}>
        {faqs.map((faq, i) => (
          <Panel header={faq.q} key={i}>
            <Paragraph>{faq.a}</Paragraph>
          </Panel>
        ))}
      </Collapse>
    </div>
  );
}
