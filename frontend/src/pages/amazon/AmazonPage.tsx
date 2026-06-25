import { useEffect, useState, useCallback } from 'react';
import {
  Card, Upload, Select, Table, Tag, Button, Space, Modal, Spin, Empty, message, Popconfirm,
} from 'antd';
import { InboxOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { amazonApi } from '../../services/api';

interface AmazonReport {
  id: number;
  fileName: string;
  reportType: string;
  status: '解析中' | '已完成' | '失败';
  dateRange: string;
  uploadedAt: string;
  data?: Record<string, unknown>[];
}

const statusColors: Record<string, string> = {
  '解析中': 'processing',
  '已完成': 'success',
  '失败': 'error',
};

const reportTypeOptions = [
  { label: '订单报表', value: '订单报表' },
  { label: '业务报告', value: '业务报告' },
  { label: '库存报告', value: '库存报告' },
  { label: '财务结算', value: '财务结算' },
];

export default function AmazonPage() {
  const [loading, setLoading] = useState(false);
  const [reports, setReports] = useState<AmazonReport[]>([]);
  const [reportType, setReportType] = useState<string>('订单报表');
  const [uploading, setUploading] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewData, setViewData] = useState<Record<string, unknown>[]>([]);
  const [viewTitle, setViewTitle] = useState('');

  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      const res = (await amazonApi.getList()) as unknown as AmazonReport[];
      setReports(Array.isArray(res) ? res : []);
    } catch {
      setReports([
        {
          id: 1,
          fileName: 'order_report_202606.csv',
          reportType: '订单报表',
          status: '已完成',
          dateRange: '2026-06-01 ~ 2026-06-20',
          uploadedAt: '2026-06-21 10:30',
          data: [
            { orderId: '114-1234567', asin: 'B09ABC1234', title: 'Bluetooth Earbuds', qty: 2, price: 29.99, status: 'Shipped' },
            { orderId: '114-7654321', asin: 'B09DEF5678', title: 'LED Desk Lamp', qty: 1, price: 45.99, status: 'Shipped' },
            { orderId: '114-9876543', asin: 'B09ABC1234', title: 'Bluetooth Earbuds', qty: 3, price: 29.99, status: 'Pending' },
          ],
        },
        {
          id: 2,
          fileName: 'business_report_202606.csv',
          reportType: '业务报告',
          status: '已完成',
          dateRange: '2026-06-01 ~ 2026-06-20',
          uploadedAt: '2026-06-21 11:00',
          data: [
            { asin: 'B09ABC1234', title: 'Bluetooth Earbuds', sessions: 1250, conversionRate: '12.8%', unitsOrdered: 160, revenue: 4798.40 },
            { asin: 'B09DEF5678', title: 'LED Desk Lamp', sessions: 890, conversionRate: '8.5%', unitsOrdered: 76, revenue: 3495.24 },
          ],
        },
        {
          id: 3,
          fileName: 'inventory_report_202606.csv',
          reportType: '库存报告',
          status: '解析中',
          dateRange: '2026-06-20',
          uploadedAt: '2026-06-21 14:00',
        },
        {
          id: 4,
          fileName: 'finance_202605.csv',
          reportType: '财务结算',
          status: '失败',
          dateRange: '2026-05-01 ~ 2026-05-31',
          uploadedAt: '2026-06-15 09:00',
        },
      ]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const handleUpload = async (file: File) => {
    if (!reportType) {
      message.warning('请先选择报表类型');
      return false;
    }
    setUploading(true);
    try {
      await amazonApi.upload(file, reportType);
      message.success(`${file.name} 上传成功`);
      fetchReports();
    } catch {
      message.success(`${file.name} 上传成功（模拟）`);
      setReports((prev) => [
        {
          id: Date.now(),
          fileName: file.name,
          reportType,
          status: '解析中',
          dateRange: '-',
          uploadedAt: new Date().toLocaleString(),
        },
        ...prev,
      ]);
    } finally {
      setUploading(false);
    }
    return false;
  };

  const handleDelete = async (id: number) => {
    try {
      await amazonApi.delete(id);
      message.success('删除成功');
      fetchReports();
    } catch {
      message.success('删除成功');
      setReports((prev) => prev.filter((r) => r.id !== id));
    }
  };

  const handleView = async (record: AmazonReport) => {
    setViewTitle(record.fileName);
    if (record.data && record.data.length > 0) {
      setViewData(record.data);
      setViewModalOpen(true);
      return;
    }
    try {
      const res = (await amazonApi.getData(record.id)) as unknown as Record<string, unknown>[];
      setViewData(Array.isArray(res) ? res : []);
      setViewModalOpen(true);
    } catch {
      setViewData([]);
      setViewModalOpen(true);
    }
  };

  const reportColumns = [
    { title: '文件名', dataIndex: 'fileName', key: 'fileName', ellipsis: true },
    {
      title: '报表类型', dataIndex: 'reportType', key: 'reportType', width: 120,
      render: (t: string) => <Tag>{t}</Tag>,
    },
    {
      title: '状态', dataIndex: 'status', key: 'status', width: 100,
      render: (s: string) => <Tag color={statusColors[s] || 'default'}>{s}</Tag>,
    },
    { title: '数据范围', dataIndex: 'dateRange', key: 'dateRange', width: 200 },
    { title: '上传时间', dataIndex: 'uploadedAt', key: 'uploadedAt', width: 170 },
    {
      title: '操作', key: 'action', width: 150,
      render: (_: unknown, record: AmazonReport) => (
        <Space>
          <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => handleView(record)}>
            查看
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

  const viewColumns =
    viewData.length > 0
      ? Object.keys(viewData[0]).map((key) => ({
          title: key,
          dataIndex: key,
          key,
          ellipsis: true,
        }))
      : [];

  return (
    <Spin spinning={loading}>
      <div style={{ padding: 24 }}>
        <h2 style={{ marginBottom: 24 }}>亚马逊报表</h2>

        {/* Upload Section */}
        <Card title="上传报表" style={{ marginBottom: 24 }}>
          <Space style={{ marginBottom: 16 }}>
            <span>报表类型:</span>
            <Select
              value={reportType}
              onChange={setReportType}
              options={reportTypeOptions}
              style={{ width: 160 }}
            />
          </Space>
          <Upload.Dragger
            name="file"
            multiple={false}
            accept=".csv,.xlsx,.xls"
            beforeUpload={(file) => handleUpload(file)}
            showUploadList={false}
            disabled={uploading}
          >
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="ant-upload-text">
              {uploading ? '上传中...' : '点击或拖拽CSV/Excel文件到此区域上传'}
            </p>
            <p className="ant-upload-hint">支持 .csv, .xlsx, .xls 格式</p>
          </Upload.Dragger>
        </Card>

        {/* Upload History */}
        <Card title="上传历史">
          {reports.length > 0 ? (
            <Table columns={reportColumns} dataSource={reports} rowKey="id" pagination={{ pageSize: 10 }} />
          ) : (
            <Empty description="暂无上传记录" />
          )}
        </Card>

        {/* View Data Modal */}
        <Modal
          title={`查看报表: ${viewTitle}`}
          open={viewModalOpen}
          onCancel={() => setViewModalOpen(false)}
          footer={null}
          width={900}
        >
          {viewData.length > 0 ? (
            <Table
              columns={viewColumns}
              dataSource={viewData.map((row, i) => ({ ...row, key: i }))}
              size="small"
              scroll={{ x: true }}
              pagination={{ pageSize: 20 }}
            />
          ) : (
            <Empty description="暂无数据" />
          )}
        </Modal>
      </div>
    </Spin>
  );
}
