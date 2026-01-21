import { Card, CardContent, Typography, Avatar, Box, IconButton, Chip, useTheme } from '@mui/material'
import { styled } from '@mui/material/styles'
import { ThumbUp, ThumbDown, ContentCopy, Check } from '@mui/icons-material'
import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import rehypeHighlight from 'rehype-highlight'
import 'highlight.js/styles/github.css'

// Styled card for messages
export const MessageCardContainer = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  borderRadius: `${(theme.shape.borderRadius as number) * 2}px`,
  boxShadow: 'none',
  border: `1px solid ${theme.palette.divider}`,
  transition: 'all 0.2s ease',
  
  '&:hover': {
    boxShadow: theme.shadows[2],
  },
}))

// Message header with sender info
export const MessageHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(1, 2),
  borderBottom: `1px solid ${theme.palette.divider}`,
  gap: theme.spacing(1),
}))

// Message content area
export const MessageContent = styled(CardContent)(({ theme }) => ({
  padding: theme.spacing(2),
  '& pre': {
    backgroundColor: theme.palette.grey[100],
    padding: theme.spacing(2),
    borderRadius: theme.shape.borderRadius,
    overflowX: 'auto',
    margin: theme.spacing(1, 0),
  },
  '& code': {
    fontFamily: 'monospace',
    backgroundColor: theme.palette.grey[100],
    padding: '2px 4px',
    borderRadius: '4px',
  },
  '& blockquote': {
    borderLeft: `4px solid ${theme.palette.primary.main}`,
    paddingLeft: theme.spacing(2),
    marginLeft: 0,
    color: theme.palette.text.secondary,
    fontStyle: 'italic',
  },
  '& table': {
    width: '100%',
    borderCollapse: 'collapse',
    margin: theme.spacing(2, 0),
    '& th, & td': {
      border: `1px solid ${theme.palette.divider}`,
      padding: theme.spacing(1),
    },
    '& th': {
      backgroundColor: theme.palette.grey[100],
      fontWeight: 600,
    },
  },
  '& img': {
    maxWidth: '100%',
    height: 'auto',
    borderRadius: theme.shape.borderRadius,
  },
}))

// Message footer with actions
export const MessageFooter = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: theme.spacing(1, 2),
  borderTop: `1px solid ${theme.palette.divider}`,
  gap: theme.spacing(1),
}))

// Message types
type MessageRole = 'user' | 'bot' | 'system' | 'tool' | 'function'

interface MessageCardProps {
  message: {
    id?: string
    role: MessageRole
    content: string
    timestamp?: string
    status?: 'sent' | 'delivered' | 'read' | 'error'
    feedback?: 'positive' | 'negative' | null
    type?: 'normal' | 'error' | 'warning' | 'system' | 'success'
    state?: 'pending' | 'completed' | 'failed' | 'processing'
  }
  onFeedback?: (feedback: 'positive' | 'negative') => void
  onCopy?: () => void
}

export const MessageCard = ({ 
  message, 
  onFeedback, 
  onCopy
}: MessageCardProps) => {
  const theme = useTheme()
  const [copied, setCopied] = useState(false)
  
  // Get role-specific styling
  const getRoleStyles = () => {
    switch (message.role) {
      case 'user':
        return {
          borderLeft: `4px solid ${theme.palette.primary.main}`,
          backgroundColor: theme.palette.primary.light + '10',
        }
      case 'bot':
        return {
          borderLeft: `4px solid ${theme.palette.secondary.main}`,
          backgroundColor: theme.palette.secondary.light + '10',
        }
      case 'system':
        return {
          borderLeft: `4px solid ${theme.palette.info.main}`,
          backgroundColor: theme.palette.info.light + '10',
        }
      case 'tool':
        return {
          borderLeft: `4px solid ${theme.palette.warning.main}`,
          backgroundColor: theme.palette.warning.light + '10',
        }
      case 'function':
        return {
          borderLeft: `4px solid ${theme.palette.success.main}`,
          backgroundColor: theme.palette.success.light + '10',
        }
      default:
        return {}
    }
  }

  // Get message type styling
  const getMessageTypeStyles = () => {
    switch (message.type) {
      case 'error':
        return {
          borderLeft: `4px solid ${theme.palette.error.main}`,
          backgroundColor: theme.palette.error.light + '10',
        }
      case 'warning':
        return {
          borderLeft: `4px solid ${theme.palette.warning.main}`,
          backgroundColor: theme.palette.warning.light + '10',
        }
      case 'success':
        return {
          borderLeft: `4px solid ${theme.palette.success.main}`,
          backgroundColor: theme.palette.success.light + '10',
        }
      case 'system':
        return {
          borderLeft: `4px solid ${theme.palette.info.main}`,
          backgroundColor: theme.palette.info.light + '10',
        }
      default:
        return {}
    }
  }

  // Get message state styling
  const getMessageStateStyles = () => {
    switch (message.state) {
      case 'pending':
        return {
          opacity: 0.8,
          borderStyle: 'dashed',
        }
      case 'completed':
        return {
          borderLeft: `4px solid ${theme.palette.success.main}`,
        }
      case 'failed':
        return {
          borderLeft: `4px solid ${theme.palette.error.main}`,
        }
      case 'processing':
        return {
          borderStyle: 'dashed',
          borderLeft: `4px solid ${theme.palette.warning.main}`,
        }
      default:
        return {}
    }
  }

  // Combine all styles with priority: state > type > role
  const combinedStyles = {
    ...getRoleStyles(),
    ...getMessageTypeStyles(),
    ...getMessageStateStyles(),
  }
  
  const handleCopy = () => {
    navigator.clipboard.writeText(message.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    onCopy?.()
  }

  return (
    <MessageCardContainer sx={combinedStyles}>
      <MessageHeader>
        <Avatar sx={{ 
          width: 24, 
          height: 24, 
          fontSize: '0.75rem',
          backgroundColor: combinedStyles.borderLeft?.split(' ')[2] || theme.palette.primary.main
        }}>
          {message.role.substring(0, 2).toUpperCase()}
        </Avatar>
        <Typography variant="body2" fontWeight={500}>
          {message.role.toUpperCase()}
        </Typography>
        {message.timestamp && (
          <Typography variant="caption" color="text.secondary">
            {new Date(message.timestamp).toLocaleTimeString()}
          </Typography>
        )}
        {message.status && (
          <Chip 
            label={message.status}
            size="small"
            color={message.status === 'error' ? 'error' : 'default'}
          />
        )}
        {message.state && (
          <Chip 
            label={message.state}
            size="small"
            color={message.state === 'completed' ? 'success' : message.state === 'failed' ? 'error' : 'warning'}
          />
        )}
      </MessageHeader>
      
      <MessageContent>
        <ReactMarkdown 
          rehypePlugins={[rehypeHighlight]}
          components={{
            // Customize heading components with proper styling
            h1: ({ node, children }) => (
              <Typography variant="h5" component="h1">{children}</Typography>
            ),
            h2: ({ node, children }) => (
              <Typography variant="h6" component="h2">{children}</Typography>
            ),
            h3: ({ node, children }) => (
              <Typography variant="subtitle1" component="h3" fontWeight={600}>{children}</Typography>
            ),
            h4: ({ node, children }) => (
              <Typography variant="subtitle2" component="h4" fontWeight={600}>{children}</Typography>
            ),
            p: ({ node, children }) => (
              <Typography variant="body1" component="p">{children}</Typography>
            ),
            li: ({ node, children }) => (
              <Typography component="li" variant="body1">{children}</Typography>
            ),
            code: ({ node, className, children, ...props }) => {
              const match = /language-(\w+)/.exec(className || '')
              return match ? (
                <code className={className} {...props}>
                  {children}
                </code>
              ) : (
                <code className="inline-code" {...props}>
                  {children}
                </code>
              )
            },
          }}
        >
          {message.content}
        </ReactMarkdown>
      </MessageContent>
      
      <MessageFooter>
        <Box display="flex" gap={1}>
          {onFeedback && (
            <>
              <IconButton 
                size="small" 
                onClick={() => onFeedback('positive')} 
                color={message.feedback === 'positive' ? 'primary' : 'default'}
              >
                <ThumbUp fontSize="small" />
              </IconButton>
              <IconButton 
                size="small" 
                onClick={() => onFeedback('negative')} 
                color={message.feedback === 'negative' ? 'error' : 'default'}
              >
                <ThumbDown fontSize="small" />
              </IconButton>
            </>
          )}
        </Box>
        
        <Box display="flex" gap={1}>
          <IconButton size="small" onClick={handleCopy}>
            {copied ? <Check fontSize="small" color="success" /> : <ContentCopy fontSize="small" />}
          </IconButton>
        </Box>
      </MessageFooter>
    </MessageCardContainer>
  )
}