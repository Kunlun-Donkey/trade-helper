import { useState, useMemo } from 'react';
import { Card, Tabs, Row, Col, InputNumber, Statistic, Typography, Divider } from 'antd';

const { Title, Text } = Typography;

export default function CalculatorPage() {
  return (
    <div style={{ padding: 24 }}>
      <Title level={3} style={{ marginBottom: 24 }}>
        计算器
      </Title>
      <Tabs
        defaultActiveKey="b2b"
        items={[
          { key: 'b2b', label: 'B2B外贸计算器', children: <B2BCalculator /> },
          { key: 'fba', label: '亚马逊FBA计算器', children: <FBACalculator /> },
        ]}
      />
    </div>
  );
}

/* ═══════════════ B2B Calculator ═══════════════ */
function B2BCalculator() {
  const [purchasePrice, setPurchasePrice] = useState<number>(50);
  const [taxRebateRate, setTaxRebateRate] = useState<number>(13);
  const [exchangeRate, setExchangeRate] = useState<number>(7.25);
  const [domesticFreight, setDomesticFreight] = useState<number>(500);
  const [packingCost, setPackingCost] = useState<number>(2);
  const [commissionRate, setCommissionRate] = useState<number>(3);
  const [profitRate, setProfitRate] = useState<number>(15);
  const [quantity, setQuantity] = useState<number>(1000);

  const results = useMemo(() => {
    const costPrice = purchasePrice;
    const taxRebate = (purchasePrice * (taxRebateRate / 100)) / (1 + taxRebateRate / 100);
    const actualCost =
      costPrice - taxRebate + (quantity > 0 ? domesticFreight / quantity : 0) + packingCost;
    const breakevenUSD = exchangeRate > 0 ? actualCost / exchangeRate : 0;
    const commissionDec = commissionRate / 100;
    const profitDec = profitRate / 100;
    const denominator = 1 - commissionDec - profitDec;
    const targetPrice = denominator > 0 ? breakevenUSD / denominator : 0;
    const netProfit = (targetPrice - breakevenUSD) * quantity * exchangeRate;
    return { costPrice, taxRebate, actualCost, breakevenUSD, targetPrice, netProfit };
  }, [purchasePrice, taxRebateRate, exchangeRate, domesticFreight, packingCost, commissionRate, profitRate, quantity]);

  return (
    <Row gutter={24}>
      <Col xs={24} lg={12}>
        <Card title="输入参数">
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <div style={{ marginBottom: 4 }}>
                <Text type="secondary">采购价 (元)</Text>
              </div>
              <InputNumber
                value={purchasePrice}
                onChange={(v) => setPurchasePrice(v || 0)}
                min={0}
                precision={2}
                style={{ width: '100%' }}
              />
            </Col>
            <Col span={12}>
              <div style={{ marginBottom: 4 }}>
                <Text type="secondary">退税率 (%)</Text>
              </div>
              <InputNumber
                value={taxRebateRate}
                onChange={(v) => setTaxRebateRate(v || 0)}
                min={0}
                max={100}
                precision={1}
                style={{ width: '100%' }}
              />
            </Col>
            <Col span={12}>
              <div style={{ marginBottom: 4 }}>
                <Text type="secondary">汇率</Text>
              </div>
              <InputNumber
                value={exchangeRate}
                onChange={(v) => setExchangeRate(v || 0)}
                min={0}
                precision={4}
                style={{ width: '100%' }}
              />
            </Col>
            <Col span={12}>
              <div style={{ marginBottom: 4 }}>
                <Text type="secondary">国内运费 (元)</Text>
              </div>
              <InputNumber
                value={domesticFreight}
                onChange={(v) => setDomesticFreight(v || 0)}
                min={0}
                precision={2}
                style={{ width: '100%' }}
              />
            </Col>
            <Col span={12}>
              <div style={{ marginBottom: 4 }}>
                <Text type="secondary">包装费 (元/件)</Text>
              </div>
              <InputNumber
                value={packingCost}
                onChange={(v) => setPackingCost(v || 0)}
                min={0}
                precision={2}
                style={{ width: '100%' }}
              />
            </Col>
            <Col span={12}>
              <div style={{ marginBottom: 4 }}>
                <Text type="secondary">佣金 (%)</Text>
              </div>
              <InputNumber
                value={commissionRate}
                onChange={(v) => setCommissionRate(v || 0)}
                min={0}
                max={100}
                precision={1}
                style={{ width: '100%' }}
              />
            </Col>
            <Col span={12}>
              <div style={{ marginBottom: 4 }}>
                <Text type="secondary">目标利润率 (%)</Text>
              </div>
              <InputNumber
                value={profitRate}
                onChange={(v) => setProfitRate(v || 0)}
                min={0}
                max={100}
                precision={1}
                style={{ width: '100%' }}
              />
            </Col>
            <Col span={12}>
              <div style={{ marginBottom: 4 }}>
                <Text type="secondary">预计数量</Text>
              </div>
              <InputNumber
                value={quantity}
                onChange={(v) => setQuantity(v || 0)}
                min={1}
                style={{ width: '100%' }}
              />
            </Col>
          </Row>
        </Card>
      </Col>
      <Col xs={24} lg={12}>
        <Card title="计算结果">
          <Row gutter={[16, 24]}>
            <Col span={12}>
              <Statistic title="成本价 (元)" value={results.costPrice} precision={2} prefix="¥" />
            </Col>
            <Col span={12}>
              <Statistic
                title="退税额 (元)"
                value={results.taxRebate}
                precision={2}
                prefix="¥"
                valueStyle={{ color: '#52c41a' }}
              />
            </Col>
            <Col span={12}>
              <Statistic title="实际成本 (元/件)" value={results.actualCost} precision={2} prefix="¥" />
            </Col>
            <Col span={12}>
              <Statistic title="保本价 (USD)" value={results.breakevenUSD} precision={2} prefix="$" />
            </Col>
            <Divider style={{ margin: '8px 0' }} />
            <Col span={12}>
              <Statistic
                title="目标报价 (USD)"
                value={results.targetPrice}
                precision={2}
                prefix="$"
                valueStyle={{ color: '#1890ff', fontSize: 28 }}
              />
            </Col>
            <Col span={12}>
              <Statistic
                title="净利润 (元)"
                value={results.netProfit}
                precision={2}
                prefix="¥"
                valueStyle={{
                  color: results.netProfit >= 0 ? '#52c41a' : '#ff4d4f',
                  fontSize: 28,
                }}
              />
            </Col>
          </Row>
        </Card>
      </Col>
    </Row>
  );
}

/* ═══════════════ FBA Calculator ═══════════════ */
function FBACalculator() {
  const [sellPrice, setSellPrice] = useState<number>(29.99);
  const [purchaseCostCNY, setPurchaseCostCNY] = useState<number>(30);
  const [shippingPerUnit, setShippingPerUnit] = useState<number>(3.5);
  const [adSpendRate, setAdSpendRate] = useState<number>(10);
  const [returnRate, setReturnRate] = useState<number>(3);
  const [exchangeRate, setExchangeRate] = useState<number>(7.25);
  const [commissionRate, setCommissionRate] = useState<number>(15);
  const [fbaFee, setFbaFee] = useState<number>(4.5);
  const [storageFee, setStorageFee] = useState<number>(0.75);

  const results = useMemo(() => {
    const commission = sellPrice * (commissionRate / 100);
    const fbaTotal = fbaFee + storageFee;
    const adCost = sellPrice * (adSpendRate / 100);
    const returnLoss = sellPrice * (returnRate / 100);
    const purchaseUSD = exchangeRate > 0 ? purchaseCostCNY / exchangeRate : 0;
    const totalCost = purchaseUSD + shippingPerUnit + commission + fbaTotal + adCost + returnLoss;
    const netProfit = sellPrice - totalCost;
    const grossMargin = sellPrice > 0 ? netProfit / sellPrice : 0;
    const breakevenPrice = totalCost;
    return { commission, fbaTotal, adCost, returnLoss, purchaseUSD, totalCost, netProfit, grossMargin, breakevenPrice };
  }, [sellPrice, purchaseCostCNY, shippingPerUnit, adSpendRate, returnRate, exchangeRate, commissionRate, fbaFee, storageFee]);

  return (
    <Row gutter={24}>
      <Col xs={24} lg={12}>
        <Card title="输入参数">
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <div style={{ marginBottom: 4 }}>
                <Text type="secondary">售价 (USD)</Text>
              </div>
              <InputNumber
                value={sellPrice}
                onChange={(v) => setSellPrice(v || 0)}
                min={0}
                precision={2}
                style={{ width: '100%' }}
              />
            </Col>
            <Col span={12}>
              <div style={{ marginBottom: 4 }}>
                <Text type="secondary">采购成本 (元)</Text>
              </div>
              <InputNumber
                value={purchaseCostCNY}
                onChange={(v) => setPurchaseCostCNY(v || 0)}
                min={0}
                precision={2}
                style={{ width: '100%' }}
              />
            </Col>
            <Col span={12}>
              <div style={{ marginBottom: 4 }}>
                <Text type="secondary">头程运费 (USD/件)</Text>
              </div>
              <InputNumber
                value={shippingPerUnit}
                onChange={(v) => setShippingPerUnit(v || 0)}
                min={0}
                precision={2}
                style={{ width: '100%' }}
              />
            </Col>
            <Col span={12}>
              <div style={{ marginBottom: 4 }}>
                <Text type="secondary">广告占比 (%)</Text>
              </div>
              <InputNumber
                value={adSpendRate}
                onChange={(v) => setAdSpendRate(v || 0)}
                min={0}
                max={100}
                precision={1}
                style={{ width: '100%' }}
              />
            </Col>
            <Col span={12}>
              <div style={{ marginBottom: 4 }}>
                <Text type="secondary">退货率 (%)</Text>
              </div>
              <InputNumber
                value={returnRate}
                onChange={(v) => setReturnRate(v || 0)}
                min={0}
                max={100}
                precision={1}
                style={{ width: '100%' }}
              />
            </Col>
            <Col span={12}>
              <div style={{ marginBottom: 4 }}>
                <Text type="secondary">汇率</Text>
              </div>
              <InputNumber
                value={exchangeRate}
                onChange={(v) => setExchangeRate(v || 0)}
                min={0}
                precision={4}
                style={{ width: '100%' }}
              />
            </Col>
            <Col span={12}>
              <div style={{ marginBottom: 4 }}>
                <Text type="secondary">佣金率 (%)</Text>
              </div>
              <InputNumber
                value={commissionRate}
                onChange={(v) => setCommissionRate(v || 0)}
                min={0}
                max={100}
                precision={1}
                style={{ width: '100%' }}
              />
            </Col>
            <Col span={12}>
              <div style={{ marginBottom: 4 }}>
                <Text type="secondary">FBA配送费 (USD)</Text>
              </div>
              <InputNumber
                value={fbaFee}
                onChange={(v) => setFbaFee(v || 0)}
                min={0}
                precision={2}
                style={{ width: '100%' }}
              />
            </Col>
            <Col span={12}>
              <div style={{ marginBottom: 4 }}>
                <Text type="secondary">仓储费 (USD)</Text>
              </div>
              <InputNumber
                value={storageFee}
                onChange={(v) => setStorageFee(v || 0)}
                min={0}
                precision={2}
                style={{ width: '100%' }}
              />
            </Col>
          </Row>
        </Card>
      </Col>
      <Col xs={24} lg={12}>
        <Card title="计算结果">
          <Row gutter={[16, 24]}>
            <Col span={8}>
              <Statistic title="采购成本 (USD)" value={results.purchaseUSD} precision={2} prefix="$" />
            </Col>
            <Col span={8}>
              <Statistic title="平台佣金" value={results.commission} precision={2} prefix="$" />
            </Col>
            <Col span={8}>
              <Statistic title="FBA费用" value={results.fbaTotal} precision={2} prefix="$" />
            </Col>
            <Col span={8}>
              <Statistic title="广告费" value={results.adCost} precision={2} prefix="$" />
            </Col>
            <Col span={8}>
              <Statistic title="退货损耗" value={results.returnLoss} precision={2} prefix="$" />
            </Col>
            <Col span={8}>
              <Statistic title="总成本" value={results.totalCost} precision={2} prefix="$" />
            </Col>
            <Divider style={{ margin: '8px 0' }} />
            <Col span={8}>
              <Statistic
                title="净利润 (USD)"
                value={results.netProfit}
                precision={2}
                prefix="$"
                valueStyle={{
                  color: results.netProfit >= 0 ? '#52c41a' : '#ff4d4f',
                  fontSize: 24,
                }}
              />
            </Col>
            <Col span={8}>
              <Statistic
                title="毛利率"
                value={results.grossMargin * 100}
                precision={1}
                suffix="%"
                valueStyle={{
                  color: results.grossMargin >= 0 ? '#1890ff' : '#ff4d4f',
                  fontSize: 24,
                }}
              />
            </Col>
            <Col span={8}>
              <Statistic
                title="保本售价"
                value={results.breakevenPrice}
                precision={2}
                prefix="$"
                valueStyle={{ color: '#faad14', fontSize: 24 }}
              />
            </Col>
          </Row>
        </Card>
      </Col>
    </Row>
  );
}
