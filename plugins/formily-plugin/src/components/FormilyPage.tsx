import React from 'react';
import { Content, Header } from '@backstage/core-components';
import { RemoteFormilyForm } from './RemoteFormilyForm';

// 从配置或环境变量获取 URL（开发时写死）
const DEFAULT_SCHEMA_URL = 'http://localhost:8080/schema/schema.json';

export const FormilyPage = () => {
  const handleSubmit = (values: Record<string, any>) => {
    // 示例：调用 Backstage API
    console.log('Submitting to backend:', values);
    alert('提交成功！请查看控制台。');
  };

  return (
    <>
      <Header title="动态表单（Formily + 远程 Schema）" />
      <Content>
        <div style={{ padding: 24, background: '#fff', borderRadius: 8, maxWidth: 600 }}>
          <RemoteFormilyForm
            schemaUrl={DEFAULT_SCHEMA_URL}
            onSubmit={handleSubmit}
          />
        </div>
      </Content>
    </>
  );
};