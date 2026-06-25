import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Form, Input, Button, Checkbox, Card, Typography, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import gsap from 'gsap';
import { useAuthStore } from '@/stores/authStore';
import { isAnimationsEnabled } from '@/utils/gsap';

const { Title, Text } = Typography;

interface LoginFormValues {
  username: string;
  password: string;
  remember: boolean;
}

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
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

  const onFinish = async (values: LoginFormValues) => {
    setLoading(true);
    try {
      await login(values.username, values.password);
      message.success('登录成功');
      navigate('/dashboard');
    } catch (error) {
      message.error(error instanceof Error ? error.message : '登录失败，请重试');
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
            <Text type="secondary">专业外贸管理平台</Text>
          </div>

          <Form<LoginFormValues>
            name="login"
            initialValues={{ remember: true }}
            onFinish={onFinish}
            size="large"
            autoComplete="off"
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
              rules={[{ required: true, message: '请输入密码' }]}
            >
              <Input.Password
                prefix={<LockOutlined style={styles.icon} />}
                placeholder="密码"
              />
            </Form.Item>

            <Form.Item>
              <div style={styles.actions}>
                <Form.Item name="remember" valuePropName="checked" noStyle>
                  <Checkbox>记住我</Checkbox>
                </Form.Item>
              </div>
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                block
                style={styles.button}
              >
                登录
              </Button>
            </Form.Item>

            <div style={styles.footer}>
              <Text type="secondary">
                没有账号？{' '}
                <Link to="/register" style={styles.link}>
                  立即注册
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
  actions: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
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

export default LoginPage;
