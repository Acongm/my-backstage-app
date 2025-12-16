import React, { useState, useEffect } from 'react';
import Form from '@rjsf/mui';
import validator from '@rjsf/validator-ajv8';
import { RJSFSchema, UiSchema } from '@rjsf/utils';
import { Alert, CircularProgress, Box } from '@mui/material';

export interface RemoteJsonFormProps {
  schemaUrl: string;
  // uiSchemaUrl?: string; // 可选：UI Schema
  onSubmit?: (data: any) => void;
}

export const RemoteJsonForm = ({
  schemaUrl,
  // uiSchemaUrl,
  onSubmit,
}: RemoteJsonFormProps) => {
  const [schema, setSchema] = useState<RJSFSchema | null>({});
  const [uiSchema, setUiSchema] = useState<UiSchema>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
  const loadSchema = async () => {
    try {
      const res = await fetch(schemaUrl);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const text = await res.text(); // 先取文本
      console.log('Raw response:', text); // 👈 关键：看实际返回内容

      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        throw new Error('Invalid JSON');
      }

      // ✅ 强校验：必须是 object，且有 properties 或 type
      if (
        typeof data !== 'object' ||
        data === null ||
        Array.isArray(data) ||
        (typeof data.type !== 'string' && typeof data.properties !== 'object')
      ) {
        throw new Error('Schema is not a valid JSON Schema object');
      }

      setSchema(data);
    } catch (err: any) {
      setError(`加载失败: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  loadSchema();
}, [schemaUrl]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" py={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (!schema) {
    return <Alert severity="warning">未加载到有效表单配置</Alert>;
  }

  console.log('Rendering form with schema:', schema);

  const handleSubmit = ({ formData }: any) => {
    console.log('表单提交:', formData);
    onSubmit?.(formData);
  };

  return (
    <Form
      schema={schema}
      uiSchema={uiSchema}
      validator={validator}
      onSubmit={handleSubmit}
    // 可选：自定义错误/提交按钮等
    />
  );
};