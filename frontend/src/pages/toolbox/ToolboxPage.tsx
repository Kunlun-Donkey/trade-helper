import { useState, useMemo } from 'react';
import {
  Card, Tabs, Row, Col, InputNumber, Typography, List, Button, message, Select, Space,
} from 'antd';
import { CopyOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

/* Default Exchange Rates */
const DEFAULT_RATES: Record<string, number> = {
  USD: 7.25,
  EUR: 7.85,
  GBP: 9.2,
  JPY: 0.048,
  HKD: 0.93,
  AUD: 4.75,
  CAD: 5.3,
  KRW: 0.0053,
};

/* Common Cities with UTC Offsets */
const CITIES = [
  { label: '北京 (UTC+8)', offset: 8 },
  { label: '上海 (UTC+8)', offset: 8 },
  { label: '东京 (UTC+9)', offset: 9 },
  { label: '首尔 (UTC+9)', offset: 9 },
  { label: '新加坡 (UTC+8)', offset: 8 },
  { label: '迪拜 (UTC+4)', offset: 4 },
  { label: '伦敦 (UTC+0)', offset: 0 },
  { label: '巴黎 (UTC+1)', offset: 1 },
  { label: '柏林 (UTC+1)', offset: 1 },
  { label: '莫斯科 (UTC+3)', offset: 3 },
  { label: '纽约 (UTC-5)', offset: -5 },
  { label: '芝加哥 (UTC-6)', offset: -6 },
  { label: '洛杉矶 (UTC-8)', offset: -8 },
  { label: '悉尼 (UTC+10)', offset: 10 },
  { label: '奥克兰 (UTC+12)', offset: 12 },
];

/* Email Templates */
const EMAIL_TEMPLATES = [
  {
    id: 1,
    title: '开发信 (Cold Outreach)',
    category: '开发信',
    content: `Subject: Quality [Product] Supplier - [Your Company]

Dear [Name],

I hope this email finds you well. My name is [Your Name] from [Your Company], a professional manufacturer of [Product Category] based in China.

We have been supplying to clients in [Country/Region] for over [X] years, and we'd love to explore cooperation opportunities with your company.

Our advantages:
- Competitive factory-direct pricing
- OEM/ODM capability
- Quality certifications (ISO, CE, etc.)
- Fast delivery within [X] days

I'd be happy to send you our latest catalog and price list. Would you be available for a quick call this week?

Best regards,
[Your Name]
[Your Company]
[Phone] | [Email]`,
  },
  {
    id: 2,
    title: '跟进信 (Follow-up)',
    category: '跟进信',
    content: `Subject: Following Up - [Product] Inquiry

Dear [Name],

I wanted to follow up on my previous email regarding [Product/Quote Reference].

Have you had a chance to review our proposal? I understand you may be busy, so I wanted to check if you need any additional information or samples.

We're currently offering [promotion/discount] for orders placed before [date], which could be a great opportunity for your business.

Please feel free to reach out if you have any questions.

Best regards,
[Your Name]`,
  },
  {
    id: 3,
    title: '催单 (Order Urgency)',
    category: '催单',
    content: `Subject: Order Confirmation Reminder - Limited Stock Alert

Dear [Name],

I hope you're doing well. I'm writing to remind you about the quote we sent on [date] for [Product].

Due to increasing raw material costs and high demand, we can only guarantee the current pricing until [date]. Production slots for [month] are also filling up quickly.

To ensure timely delivery, we recommend confirming your order by [date]. Here's a quick summary:
- Product: [Product Name]
- Quantity: [X] units
- Unit Price: $[X]
- Delivery: [X] days after order confirmation

Would you like to proceed? I'm happy to assist with any adjustments.

Best regards,
[Your Name]`,
  },
  {
    id: 4,
    title: '售后信 (After-sales)',
    category: '售后',
    content: `Subject: Thank You for Your Order - Follow-up

Dear [Name],

Thank you for your recent order (Order No: [XXX]). We hope the products have arrived in good condition and meet your expectations.

We'd love to hear your feedback:
1. Were you satisfied with the product quality?
2. Was the packaging adequate?
3. Any suggestions for improvement?

Your feedback helps us serve you better. If you encounter any issues, please don't hesitate to contact us - we're here to help.

We look forward to our continued partnership.

Best regards,
[Your Name]
[Your Company]`,
  },
];

export default function ToolboxPage() {
  return (
    <div style={{ padding: 24 }}>
      <Title level={3} style={{ marginBottom: 24 }}>
        工具箱
      </Title>
      <Tabs
        defaultActiveKey="exchange"
        items={[
          { key: 'exchange', label: '汇率查询', children: <ExchangeRateTab /> },
          { key: 'timezone', label: '时差查询', children: <TimezoneTab /> },
          { key: 'convert', label: '单位换算', children: <UnitConverterTab /> },
          { key: 'email', label: '邮件模板', children: <EmailTemplateTab /> },
        ]}
      />
    </div>
  );
}

/* ═══════════════ Exchange Rate ═══════════════ */
function ExchangeRateTab() {
  const [rates] = useState<Record<string, number>>(DEFAULT_RATES);
  const [amount, setAmount] = useState<number>(1);
  const [fromCurrency, setFromCurrency] = useState<string>('USD');

  const converted = useMemo(() => {
    const rate = rates[fromCurrency] || 1;
    return amount * rate;
  }, [amount, fromCurrency, rates]);

  return (
    <Row gutter={24}>
      <Col xs={24} lg={12}>
        <Card title="主要汇率 (兑人民币)">
          <List
            dataSource={Object.entries(rates)}
            renderItem={([currency, rate]) => (
              <List.Item>
                <Text strong>1 {currency}</Text>
                <Text>= {rate.toFixed(4)} CNY</Text>
              </List.Item>
            )}
          />
        </Card>
      </Col>
      <Col xs={24} lg={12}>
        <Card title="汇率换算器">
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            <div>
              <Text type="secondary" style={{ display: 'block', marginBottom: 4 }}>
                金额
              </Text>
              <InputNumber
                value={amount}
                onChange={(v) => setAmount(v || 0)}
                min={0}
                precision={2}
                style={{ width: '100%' }}
                size="large"
              />
            </div>
            <div>
              <Text type="secondary" style={{ display: 'block', marginBottom: 4 }}>
                币种
              </Text>
              <Select
                value={fromCurrency}
                onChange={setFromCurrency}
                style={{ width: '100%' }}
                size="large"
                options={Object.keys(rates).map((c) => ({ label: c, value: c }))}
              />
            </div>
            <Card style={{ background: '#f6ffed', borderColor: '#b7eb8f' }}>
              <Title level={4} style={{ margin: 0, color: '#52c41a' }}>
                {amount} {fromCurrency} = {converted.toFixed(2)} CNY
              </Title>
            </Card>
          </Space>
        </Card>
      </Col>
    </Row>
  );
}

/* ═══════════════ Timezone ═══════════════ */
function TimezoneTab() {
  const [city1, setCity1] = useState<number>(8); // Beijing
  const [city2, setCity2] = useState<number>(-5); // New York

  const info = useMemo(() => {
    const diff = city1 - city2;
    const now = new Date();
    const city1Time = new Date(
      now.getTime() + (city1 - 8) * 3600000 + now.getTimezoneOffset() * 60000,
    );
    const city2Time = new Date(
      now.getTime() + (city2 - 8) * 3600000 + now.getTimezoneOffset() * 60000,
    );

    const formatTime = (d: Date) =>
      d.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      });

    return {
      diff: Math.abs(diff),
      direction: diff > 0 ? '快于' : diff < 0 ? '慢于' : '相同',
      city1Time: formatTime(city1Time),
      city2Time: formatTime(city2Time),
    };
  }, [city1, city2]);

  return (
    <Row gutter={24}>
      <Col xs={24} md={12}>
        <Card title="城市选择">
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            <div>
              <Text type="secondary" style={{ display: 'block', marginBottom: 4 }}>
                城市一
              </Text>
              <Select
                value={city1}
                onChange={setCity1}
                style={{ width: '100%' }}
                size="large"
                options={CITIES.map((c) => ({ label: c.label, value: c.offset }))}
              />
            </div>
            <div>
              <Text type="secondary" style={{ display: 'block', marginBottom: 4 }}>
                城市二
              </Text>
              <Select
                value={city2}
                onChange={setCity2}
                style={{ width: '100%' }}
                size="large"
                options={CITIES.map((c) => ({ label: c.label, value: c.offset }))}
              />
            </div>
          </Space>
        </Card>
      </Col>
      <Col xs={24} md={12}>
        <Card title="时差结果">
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <Title level={2} style={{ color: '#1890ff' }}>
              {info.diff} 小时
            </Title>
            <Text style={{ fontSize: 16 }}>
              城市一 {info.direction} 城市二 {info.diff} 小时
            </Text>
            <div style={{ marginTop: 24 }}>
              <Card size="small" style={{ marginBottom: 12, background: '#f0f5ff' }}>
                <Text strong>城市一当前时间: </Text>
                <Text>{info.city1Time}</Text>
              </Card>
              <Card size="small" style={{ background: '#fff7e6' }}>
                <Text strong>城市二当前时间: </Text>
                <Text>{info.city2Time}</Text>
              </Card>
            </div>
          </div>
        </Card>
      </Col>
    </Row>
  );
}

/* ═══════════════ Unit Converter ═══════════════ */
function UnitConverterTab() {
  return (
    <Row gutter={24}>
      <Col xs={24} lg={8}>
        <UnitCard
          title="长度换算"
          units={[
            { label: '厘米 (cm)', toBase: (v) => v, fromBase: (v) => v },
            { label: '英寸 (inch)', toBase: (v) => v * 2.54, fromBase: (v) => v / 2.54 },
            { label: '米 (m)', toBase: (v) => v * 100, fromBase: (v) => v / 100 },
            { label: '英尺 (ft)', toBase: (v) => v * 30.48, fromBase: (v) => v / 30.48 },
          ]}
        />
      </Col>
      <Col xs={24} lg={8}>
        <UnitCard
          title="重量换算"
          units={[
            { label: '千克 (kg)', toBase: (v) => v, fromBase: (v) => v },
            { label: '磅 (lb)', toBase: (v) => v * 0.4536, fromBase: (v) => v / 0.4536 },
            { label: '盎司 (oz)', toBase: (v) => v * 0.02835, fromBase: (v) => v / 0.02835 },
          ]}
        />
      </Col>
      <Col xs={24} lg={8}>
        <UnitCard
          title="体积换算"
          units={[
            { label: '升 (L)', toBase: (v) => v, fromBase: (v) => v },
            { label: '加仑 (gallon)', toBase: (v) => v * 3.785, fromBase: (v) => v / 3.785 },
            { label: '立方厘米 (cm3)', toBase: (v) => v / 1000, fromBase: (v) => v * 1000 },
          ]}
        />
      </Col>
    </Row>
  );
}

interface UnitDef {
  label: string;
  toBase: (v: number) => number;
  fromBase: (v: number) => number;
}

function UnitCard({ title, units }: { title: string; units: UnitDef[] }) {
  const [values, setValues] = useState<number[]>(units.map(() => 0));

  const handleChange = (index: number, val: number) => {
    const base = units[index].toBase(val || 0);
    const newValues = units.map((u) => parseFloat(u.fromBase(base).toFixed(6)));
    setValues(newValues);
  };

  return (
    <Card title={title}>
      {units.map((u, i) => (
        <div key={u.label} style={{ marginBottom: 12 }}>
          <Text type="secondary" style={{ display: 'block', marginBottom: 4 }}>
            {u.label}
          </Text>
          <InputNumber
            value={values[i]}
            onChange={(v) => handleChange(i, v || 0)}
            precision={4}
            style={{ width: '100%' }}
          />
        </div>
      ))}
    </Card>
  );
}

/* ═══════════════ Email Templates ═══════════════ */
function EmailTemplateTab() {
  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content).then(
      () => message.success('已复制到剪贴板'),
      () => message.error('复制失败'),
    );
  };

  return (
    <List
      grid={{ gutter: 16, xs: 1, sm: 1, md: 2, lg: 2 }}
      dataSource={EMAIL_TEMPLATES}
      renderItem={(item) => (
        <List.Item>
          <Card
            title={item.title}
            extra={
              <Button
                type="primary"
                size="small"
                icon={<CopyOutlined />}
                onClick={() => handleCopy(item.content)}
              >
                复制
              </Button>
            }
            style={{ height: '100%' }}
          >
            <pre
              style={{
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                maxHeight: 300,
                overflow: 'auto',
                fontSize: 13,
                lineHeight: 1.6,
                background: '#fafafa',
                padding: 12,
                borderRadius: 6,
              }}
            >
              {item.content}
            </pre>
          </Card>
        </List.Item>
      )}
    />
  );
}
