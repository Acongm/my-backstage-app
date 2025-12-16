import React from 'react';
import { Content, Header } from '@backstage/core-components';
import { RemoteJsonForm } from './RemoteJsonForm';

// 从配置或环境获取 URL（开发时写死）
const SCHEMA_URL = 'http://localhost:8080/schema/schema.json';
// const UI_SCHEMA_URL = 'http://localhost:8080/ui-schema.json'; // 可选

export const RemoteFormPage = () => {
  const handleSubmit = (data: any) => {
    // 示例：调用 Backstage API
    console.log('提交到后端:', data);
    alert('提交成功！请查看控制台。');
  };

  return (
    <>
      <Header title="远程动态表单（RJSF + JSON Schema）" />
      <Content>
        <div
          style={{
            padding: 24,
            background: '#fff',
            borderRadius: 8,
            maxWidth: 600,
          }}
        >
          <RemoteJsonForm
            schemaUrl={SCHEMA_URL}
            // uiSchemaUrl={UI_SCHEMA_URL}
            onSubmit={handleSubmit}
          />
        </div>
      </Content>
    </>
  );
};
