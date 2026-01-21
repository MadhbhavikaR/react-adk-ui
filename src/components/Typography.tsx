import { Typography as MuiTypography, TypographyProps as MuiTypographyProps } from '@mui/material'
import { styled } from '@mui/material/styles'

export const Typography = styled(MuiTypography)(({ theme }) => ({
  // Default styling
  color: theme.palette.text.primary,
  fontFamily: theme.typography.fontFamily,
  lineHeight: theme.typography.body1.lineHeight,
  
  // Variant-specific styling
  '&.h1': {
    fontSize: theme.typography.h1.fontSize,
    fontWeight: theme.typography.h1.fontWeight,
    lineHeight: theme.typography.h1.lineHeight,
    marginBottom: theme.spacing(2),
  },
  '&.h2': {
    fontSize: theme.typography.h2.fontSize,
    fontWeight: theme.typography.h2.fontWeight,
    lineHeight: theme.typography.h2.lineHeight,
    marginBottom: theme.spacing(2),
  },
  '&.h3': {
    fontSize: theme.typography.h3.fontSize,
    fontWeight: theme.typography.h3.fontWeight,
    lineHeight: theme.typography.h3.lineHeight,
    marginBottom: theme.spacing(2),
  },
  '&.h4': {
    fontSize: theme.typography.h4.fontSize,
    fontWeight: theme.typography.h4.fontWeight,
    lineHeight: theme.typography.h4.lineHeight,
    marginBottom: theme.spacing(2),
  },
  '&.h5': {
    fontSize: theme.typography.h5.fontSize,
    fontWeight: theme.typography.h5.fontWeight,
    lineHeight: theme.typography.h5.lineHeight,
    marginBottom: theme.spacing(2),
  },
  '&.h6': {
    fontSize: theme.typography.h6.fontSize,
    fontWeight: theme.typography.h6.fontWeight,
    lineHeight: theme.typography.h6.lineHeight,
    marginBottom: theme.spacing(2),
  },
  '&.body1': {
    fontSize: theme.typography.body1.fontSize,
    lineHeight: theme.typography.body1.lineHeight,
  },
  '&.body2': {
    fontSize: theme.typography.body2.fontSize,
    lineHeight: theme.typography.body2.lineHeight,
  },
  '&.subtitle1': {
    fontSize: '1rem',
    fontWeight: 500,
    lineHeight: 1.5,
  },
  '&.subtitle2': {
    fontSize: '0.875rem',
    fontWeight: 500,
    lineHeight: 1.5,
  },
  '&.caption': {
    fontSize: '0.75rem',
    lineHeight: 1.66,
    color: theme.palette.text.secondary,
  },
  '&.overline': {
    fontSize: '0.75rem',
    fontWeight: 500,
    lineHeight: 2.66,
    textTransform: 'uppercase',
    color: theme.palette.text.secondary,
  },
}))

export interface TypographyProps extends MuiTypographyProps {
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'subtitle1' | 'subtitle2' | 'body1' | 'body2' | 'caption' | 'overline'
}

export const H1 = (props: TypographyProps) => <Typography variant="h1" {...props} />
export const H2 = (props: TypographyProps) => <Typography variant="h2" {...props} />
export const H3 = (props: TypographyProps) => <Typography variant="h3" {...props} />
export const H4 = (props: TypographyProps) => <Typography variant="h4" {...props} />
export const H5 = (props: TypographyProps) => <Typography variant="h5" {...props} />
export const H6 = (props: TypographyProps) => <Typography variant="h6" {...props} />
export const Subtitle1 = (props: TypographyProps) => <Typography variant="subtitle1" {...props} />
export const Subtitle2 = (props: TypographyProps) => <Typography variant="subtitle2" {...props} />
export const Body1 = (props: TypographyProps) => <Typography variant="body1" {...props} />
export const Body2 = (props: TypographyProps) => <Typography variant="body2" {...props} />
export const Caption = (props: TypographyProps) => <Typography variant="caption" {...props} />
export const Overline = (props: TypographyProps) => <Typography variant="overline" {...props} />