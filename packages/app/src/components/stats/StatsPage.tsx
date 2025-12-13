import React, { useEffect, useState } from 'react';
import { Content, Header, Page, Progress } from '@backstage/core-components';
import { Typography, Grid, Paper } from '@material-ui/core';
import { useApi } from '@backstage/core-plugin-api';
import { statsApiRefCore as statsApiRef } from '@org/plugin-my-stats-frontend';

type Stats = { services: number; apis: number; docs: number };

export const StatsPage = () => {
  const [data, setData] = useState<Stats | null>(null);
  const [error, setError] = useState<string | null>(null);

  const api = useApi(statsApiRef);
  useEffect(() => {
    api
      .getStats()
      .then(json => setData(json as Stats))
      .catch(e => setError((e as Error).message));
  }, [api]);

  return (
    <Page themeId="home">
      <Header title="Stats" subtitle="Example statistics" />
      <Content>
        {!data && !error && <Progress />}
        {error && <Typography color="error">Failed: {error}</Typography>}
        {data && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Paper style={{ padding: 16 }}>
                <Typography variant="h6">Services</Typography>
                <Typography variant="h3">{data.services}</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper style={{ padding: 16 }}>
                <Typography variant="h6">APIs</Typography>
                <Typography variant="h3">{data.apis}</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper style={{ padding: 16 }}>
                <Typography variant="h6">Docs</Typography>
                <Typography variant="h3">{data.docs}</Typography>
              </Paper>
            </Grid>
          </Grid>
        )}
      </Content>
    </Page>
  );
};
