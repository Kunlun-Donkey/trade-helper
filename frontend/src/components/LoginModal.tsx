import { useEffect, useRef, useState } from 'react';
import { Modal, Form, Input, Button, Tabs, message } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import gsap from 'gsap';
import useAuthStore from '@/stores/authStore';

export default function LoginModal() {
  const { loginModalVisible, loginModalTab, hideLoginModal, login, register, showLoginModal } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'login' | 'register'>(loginModalTab);
  const [loading, setLoading] = useState(false);
  const [loginForm] = Form.useForm();
  const [registerForm] = Form.useForm();
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setActiveTab(loginModalTab);
  }, [loginModalTab]);

  useEffect(() => {
    if (loginModalVisible && modalRef.current) {
      gsap.fromTo(
        modalRef.current,
        { opacity: 0, scale: 0.9, y: 20 },
        { opacity: 1, scale: 1, y: 0, duration: 0.35, ease: 'back.out(1.4)' }
      );
    }
  }, [loginModalVisible]);

  const handleLogin = async () => {
    try {
      const values = await loginForm.validateFields();
      setLoading(true);
      await login(values.username, values.password);
      message.success('登录成功');
      hideLoginModal();
      loginForm.resetFields();
    } catch (error) {
      message.error(error instanceof Error ? error.message : '登录失败');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    try {
      const values = await registerForm.validateFields();
      setLoading(true);
      await register(values);
      message.success('注册成功，请登录');
      setActiveTab('login');
      registerForm.resetFields();
    } catch (error) {
      message.error(error instanceof Error ? error.message : '注册失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={loginModalVisible}
      onCancel={hideLoginModal}
      footer={null}
      width={420}
      destroyOnClose
      centered
      styles={{ body: { padding: '24px 24px 16px' } }}
    >
      <div ref={modalRef}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <h2 style={{ margin: '0 0 8px', fontSize: 22, fontWeight: 600 }}>
            {activeTab === 'login' ? '欢迎回来' : '注册账号'}
          </h2>
          <p style={{ color: '#666', margin: 0, fontSize: 14 }}>
            {activeTab === 'login'
              ? '登录解锁全部数据存储与导出功能'
              : '注册后永久保存您的客户、订单、产品数据'}
          </p>
        </div>

        <Tabs
          activeKey={activeTab}
          onChange={(key) => setActiveTab(key as 'login' | 'register')}
          centered
          items={[
            {
              key: 'login',
              label: '登录',
              children: (
                <Form form={loginForm} layout="vertical" onFinish={handleLogin}>
                  <Form.Item name="username" rules={[{ required: true, message: '请输入用户名' }]}>
                    <Input prefix={<UserOutlined />} placeholder="用户名" size="large" />
                  </Form.Item>
                  <Form.Item name="password" rules={[{ required: true, message: '请输入密码' }]}>
                    <Input.Password prefix={<LockOutlined />} placeholder="密码" size="large" />
                  </Form.Item>
                  <Form.Item style={{ marginBottom: 12 }}>
                    <Button type="primary" htmlType="submit" block size="large" loading={loading}>
                      登录
                    </Button>
                  </Form.Item>
                </Form>
              ),
            },
            {
              key: 'register',
              label: '注册',
              children: (
                <Form form={registerForm} layout="vertical" onFinish={handleRegister}>
                  <Form.Item name="username" rules={[{ required: true, message: '请输入用户名' }]}>
                    <Input prefix={<UserOutlined />} placeholder="用户名" size="large" />
                  </Form.Item>
                  <Form.Item name="password" rules={[{ required: true, message: '请输入密码' }, { min: 6, message: '密码至少6位' }]}>
                    <Input.Password prefix={<LockOutlined />} placeholder="密码（至少6位）" size="large" />
                  </Form.Item>
                  <Form.Item name="email">
                    <Input prefix={<MailOutlined />} placeholder="邮箱（选填）" size="large" />
                  </Form.Item>
                  <Form.Item style={{ marginBottom: 12 }}>
                    <Button type="primary" htmlType="submit" block size="large" loading={loading}>
                      注册
                    </Button>
                  </Form.Item>
                </Form>
              ),
            },
          ]}
        />

        <div style={{ textAlign: 'center', color: '#999', fontSize: 12, marginTop: 8 }}>
          登录即表示您同意我们的服务条款和隐私政策
        </div>
      </div>
    </Modal>
  );
}
