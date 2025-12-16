import React, { useEffect, useState } from 'react';
import {
  Content,
  Header,
  Page,
  Progress,
  Table,
  TableColumn,
  EmptyState,
  ErrorPanel,
} from '@backstage/core-components';
import { Button, Dialog, DialogTitle, DialogContent } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';
import { Box } from '@mui/material';
import Form from '@rjsf/mui';
import validator from '@rjsf/validator-ajv8';
import { RJSFSchema, UiSchema } from '@rjsf/utils';
import { useApi } from '@backstage/core-plugin-api';
import { formilyApiRef } from '../api';
import { FormilyItem, CreateItemInput, UpdateItemInput } from '@org/plugin-formily-client';
import formSchema from '../../schema/schema.json';

/**
 * Template 主页面组件
 * 
 * 展示所有项目，支持 CRUD 操作
 */
const schema = formSchema as RJSFSchema;
const uiSchema: UiSchema = {};

export const TemplatePage = () => {
  const api = useApi(formilyApiRef);
  const [items, setItems] = useState<FormilyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<FormilyItem | null>(null);
  const [formData, setFormData] = useState<any>({});

  // 加载数据
  const loadItems = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.listItems();

      const normalized = data.map(item => {
        let metadata: any = item.metadata;
        if (typeof metadata === 'string') {
          try {
            metadata = JSON.parse(metadata);
          } catch {
            metadata = undefined;
          }
        }
        return {
          ...item,
          metadata,
        } as FormilyItem;
      });

      setItems(normalized);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, [api]);

  // 打开创建对话框
  const handleCreate = () => {
    setEditingItem(null);
    setFormData({});
    setDialogOpen(true);
  };

  // 打开编辑对话框
  const handleEdit = (item: FormilyItem) => {
    const meta =
      item.metadata && typeof item.metadata === 'object' && !Array.isArray(item.metadata)
        ? (item.metadata as any)
        : {};

    const merged = {
      ...meta,
      name: meta.name ?? item.name ?? '',
      description: meta.description ?? meta.bio ?? item.description ?? '',
      email: meta.email ?? '',
      age: meta.age ?? '',
      bio: meta.bio ?? meta.description ?? '',
    };

    setEditingItem(item);
    setFormData(merged);
    setDialogOpen(true);
  };

  // 保存项目
  const handleSave = async (data: any) => {
    const name = data.name || '未命名';
    const description = data.bio || data.description || '';
    const type = data.type || 'default';

    try {
      if (editingItem) {
        const changes: UpdateItemInput = {
          name,
          type,
          description: description || null,
          metadata: data,
        };
        await api.updateItem(editingItem.id, changes);
      } else {
        const input: CreateItemInput = {
          name,
          type,
          description: description || null,
          metadata: data,
        };
        await api.createItem(input);
      }
      setDialogOpen(false);
      await loadItems();
    } catch (e) {
      setError((e as Error).message);
    }
  };

  // 删除项目
  const handleDelete = async (id: number) => {
    if (!window.confirm('确定要删除这个项目吗？')) {
      return;
    }
    try {
      await api.deleteItem(id);
      await loadItems();
    } catch (e) {
      setError((e as Error).message);
    }
  };

  // 表格列定义
  const columns: TableColumn<FormilyItem>[] = [
    {
      title: 'ID',
      field: 'id',
      width: '80px',
    },
    {
      title: '名称',
      field: 'name',
    },
    {
      title: '类型',
      field: 'type',
    },
    {
      title: '描述',
      field: 'description',
      render: (item: FormilyItem) => item.description || '-',
    },
    {
      title: '创建时间',
      field: 'created_at',
      render: (item: FormilyItem) => new Date(item.created_at).toLocaleString(),
    },
    {
      title: '操作',
      render: (item: FormilyItem) => (
        <>
          <Button
            size="small"
            startIcon={<EditIcon />}
            onClick={() => handleEdit(item)}
            style={{ marginRight: 8 }}
          >
            编辑
          </Button>
          <Button
            size="small"
            color="secondary"
            startIcon={<DeleteIcon />}
            onClick={() => handleDelete(item.id)}
          >
            删除
          </Button>
        </>
      ),
    },
  ];

  return (
    <Page themeId="home">
      <Header title="Template Plugin" subtitle="模板插件示例页面">
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleCreate}
        >
          新建项目
        </Button>
      </Header>
      <Content>
        {error && <ErrorPanel error={new Error(error)} />}
        {loading && <Progress />}
        {!loading && !error && items.length === 0 && (
          <EmptyState
            missing="data"
            title="暂无数据"
            description="点击上方按钮创建第一个项目"
          />
        )}
        {!loading && !error && items.length > 0 && (
          <Table
            options={{
              search: true,
              paging: true,
              pageSize: 10,
              showEmptyDataSourceMessage: true,
            }}
            data={items}
            columns={columns}
            title="项目列表"
          />
        )}

        <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>{editingItem ? '编辑项目' : '新建项目'}</DialogTitle>
          <DialogContent>
            <Form
              schema={schema}
              uiSchema={uiSchema}
              validator={validator}
              formData={formData}
              onChange={e => setFormData(e.formData)}
              onSubmit={e => handleSave(e.formData)}
            >
              <Box display="flex" justifyContent="flex-end" mt={2}>
                <Button onClick={() => setDialogOpen(false)} style={{ marginRight: 8 }}>
                  取消
                </Button>
                <Button type="submit" color="primary" variant="contained">
                  保存
                </Button>
              </Box>
            </Form>
          </DialogContent>
        </Dialog>
      </Content>
    </Page>
  );
};
