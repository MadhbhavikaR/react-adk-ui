import React, { ReactNode } from 'react'
import { Box, Container, Grid } from '@mui/material'

interface ResponsiveGridProps {
  children: ReactNode
  container?: boolean
  spacing?: number
  columns?: { xs?: number, sm?: number, md?: number, lg?: number, xl?: number }
}

export const ResponsiveGrid = ({ 
  children, 
  container = true, 
  spacing = 2, 
  columns = { xs: 12, sm: 6, md: 4, lg: 3, xl: 2 }
}: ResponsiveGridProps) => {
  return (
    <Container maxWidth={container ? 'xl' : false} disableGutters={!container}>
      <Grid container spacing={spacing}>
        {React.Children.map(children, (child) => (
          <Grid 
            xs={columns.xs || 12}
            sm={columns.sm}
            md={columns.md}
            lg={columns.lg}
            xl={columns.xl}
            item
          >
            {child}
          </Grid>
        ))}
      </Grid>
    </Container>
  )
}

// Responsive container component
interface ResponsiveContainerProps {
  children: ReactNode
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | false
}

export const ResponsiveContainer = ({ 
  children, 
  maxWidth = 'xl'
}: ResponsiveContainerProps) => {
  return (
    <Container maxWidth={maxWidth}>
      <Box sx={{ 
        width: '100%',
        padding: { xs: '0.5rem', sm: '1rem', md: '1.5rem' },
        boxSizing: 'border-box'
      }}>
        {children}
      </Box>
    </Container>
  )
}