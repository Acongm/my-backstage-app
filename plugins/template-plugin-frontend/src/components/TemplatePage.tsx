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
import { Typography, Grid, Paper, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';
import { useApi } from '@backstage/frontend-plugin-api';
import { templateApiRef } from '../api';
import { TemplateItem, CreateItemInput, UpdateItemInput } from '@org/plugin-template-client';

/**
 * Template 主页面组件
 * 
 * 展示所有项目，支持 CRUD 操作
 */
export const TemplatePage = () => {
  const api = useApi(templateApiRef);
  const [items, setItems] = useState<TemplateItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<TemplateItem | null>(null);
  const [formData, setFormData] = useState<CreateItemInput>({
    name: '',
    type: '',
    description: '',
  });

  // 加载数据
  const loadItems = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.listItems();
      setItems(data);
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
    setFormData({ name: '', type: '', description: '' });
    setDialogOpen(true);
  };

  // 打开编辑对话框
  const handleEdit = (item: TemplateItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      type: item.type,
      description: item.description || '',
    });
    setDialogOpen(true);
  };

  // 保存项目
  const handleSave = async () => {
    try {
      if (editingItem) {
        // 更新
        const changes: UpdateItemInput = {
          name: formData.name,
          type: formData.type,
          description: formData.description || null,
        };
        await api.updateItem(editingItem.id, changes);
      } else {
        // 创建
        await api.createItem(formData);
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
  const columns: TableColumn<TemplateItem>[] = [
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
      render: (item: TemplateItem) => item.description || '-',
    },
    {
      title: '创建时间',
      field: 'created_at',
      render: (item: TemplateItem) => new Date(item.created_at).toLocaleString(),
    },
    {
      title: '操作',
      render: (item: TemplateItem) => (
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
      <Header
        title="Template Plugin"
        subtitle="模板插件示例页面"
        action={
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleCreate}
          >
            新建项目
          </Button>
        }
      />
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

        {/* 创建/编辑对话框 */}
        <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>{editingItem ? '编辑项目' : '新建项目'}</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} style={{ marginTop: 8 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="名称"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="类型"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="描述"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  multiline
                  rows={3}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>取消</Button>
            <Button onClick={handleSave} color="primary" variant="contained">
              保存
            </Button>
          </DialogActions>
        </Dialog>
      </Content>
    </Page>
  );
};

