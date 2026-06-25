import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Form, Input, Button, Card, Typography, message } from 'antd';
import {
  UserOutlined,
  LockOutlined,
  MailOutlined,
  BankOutlined,
  PhoneOutlined,
} from '@ant-design/icons';
import gsap from 'gsap';
import { isAnimationsEnabled } from '@/utils/gsap';
import { useAuthStore } from '@/stores/authStore';

const { Title, Text } = Typography;

interface RegisterFormValues {
  username: string;
  password: string;
  confirmPassword: string;
  email?: string;
  company?: string;
  phone?: string;
}

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const register = useAuthStore((state) => state.register);
  const [loading, setLoading] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!cardRef.current || !isAnimationsEnabled()) return;
    gsap.fromTo(
      cardRef.current,
      { opacity: 0, y: 30, scale: 0.95 },
      { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: 'back.out(1.7)' }
    );
  }, []);

  const onFinish = async (values: RegisterFormValues) => {
    setLoading(true);
    try {
      await register({
        username: values.username,
        password: values.password,
        email: values.email,
        company: values.company,
        phone: values.phone,
      });
      message.success('注册成功，请登录');
      navigate('/login');
    } catch (error) {
      message.error(error instanceof Error ? error.message : '注册失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.container}>
        <Card ref={cardRef} style={styles.card} bordered={false}>
          <div style={styles.header}>
            <Title level={2} style={styles.title}>
              外贸轻助手
            </Title>
            <Text type="secondary">创建您的账号</Text>
          </div>

          <Form<RegisterFormValues>
            name="register"
            onFinish={onFinish}
            size="large"
            autoComplete="off"
            scrollToFirstError
          >
            <Form.Item
              name="username"
              rules={[{ required: true, message: '请输入用户名' }]}
            >
              <Input
                prefix={<UserOutlined style={styles.icon} />}
                placeholder="用户名"
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[
                { required: true, message: '请输入密码' },
                { min: 6, message: '密码至少6个字符' },
              ]}
              hasFeedback
            >
              <Input.Password
                prefix={<LockOutlined style={styles.icon} />}
                placeholder="密码（至少6位）"
              />
            </Form.Item>

            <Form.Item
              name="confirmPassword"
              dependencies={['password']}
              hasFeedback
              rules={[
                { required: true, message: '请确认密码' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('两次输入的密码不一致'));
                  },
                }),
              ]}
            >
              <Input.Password
                prefix={<LockOutlined style={styles.icon} />}
                placeholder="确认密码"
              />
            </Form.Item>

            <Form.Item
              name="email"
              rules={[{ type: 'email', message: '请输入有效的邮箱地址' }]}
            >
              <Input
                prefix={<MailOutlined style={styles.icon} />}
                placeholder="邮箱（选填）"
              />
            </Form.Item>

            <Form.Item name="company">
              <Input
                prefix={<BankOutlined style={styles.icon} />}
                placeholder="公司名称（选填）"
              />
            </Form.Item>

            <Form.Item name="phone">
              <Input
                prefix={<PhoneOutlined style={styles.icon} />}
                placeholder="手机号（选填）"
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                block
                style={styles.button}
              >
                注册
              </Button>
            </Form.Item>

            <div style={styles.footer}>
              <Text type="secondary">
                已有账号？{' '}
                <Link to="/login" style={styles.link}>
                  立即登录
                </Link>
              </Text>
            </div>
          </Form>
        </Card>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: '20px',
  },
  container: {
    width: '100%',
    maxWidth: 420,
  },
  card: {
    borderRadius: 12,
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
    padding: '20px 0',
  },
  header: {
    textAlign: 'center' as const,
    marginBottom: 32,
  },
  title: {
    marginBottom: 4,
    fontWeight: 700,
    color: '#1a1a2e',
  },
  icon: {
    color: 'rgba(0, 0, 0, 0.25)',
  },
  button: {
    height: 44,
    fontSize: 16,
    borderRadius: 8,
  },
  footer: {
    textAlign: 'center' as const,
    marginTop: 8,
  },
  link: {
    color: '#667eea',
    fontWeight: 500,
  },
};

export default RegisterPage;
