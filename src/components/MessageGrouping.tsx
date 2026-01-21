import { useState } from 'react'
import { Button, Menu, MenuItem, Typography, Chip } from '@mui/material'
import { useSessionStore } from '../stores/sessionStore'
import { styled } from '@mui/material/styles'

export const MessageGrouping = () => {
  const { getGroupedMessages } = useSessionStore()
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [groupBy, setGroupBy] = useState<'date' | 'conversation' | 'role' | 'none'>('none')
  
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleGroupChange = (type: 'date' | 'conversation' | 'role' | 'none') => {
    setGroupBy(type)
    handleClose()
  }

  const groupedMessages = groupBy !== 'none' ? getGroupedMessages(groupBy) : null
  const groupCount = groupedMessages ? Object.keys(groupedMessages).length : 0

  return (
    <>
      <GroupButton 
        onClick={handleClick}
        aria-controls="group-menu"
        aria-haspopup="true"
        aria-label="Group messages"
      >
        Group by: {groupBy === 'none' ? 'None' : groupBy}
      </GroupButton>

      <Menu
        id="group-menu"
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        <MenuItem onClick={() => handleGroupChange('none')}>None</MenuItem>
        <MenuItem onClick={() => handleGroupChange('date')}>Date</MenuItem>
        <MenuItem onClick={() => handleGroupChange('conversation')}>Conversation</MenuItem>
        <MenuItem onClick={() => handleGroupChange('role')}>Role</MenuItem>
      </Menu>

      {groupBy !== 'none' && groupCount > 0 && (
        <GroupInfo>
          <Typography variant="caption">
            Grouped into {groupCount} {groupBy} {groupCount === 1 ? 'group' : 'groups'}
          </Typography>
        </GroupInfo>
      )}
    </>
  )
}

const GroupButton = styled(Button)(({ theme }) => ({
  minWidth: 'auto',
  padding: theme.spacing(1),
  marginLeft: theme.spacing(1),
}))

const GroupInfo = styled('div')(({ theme }) => ({
  marginLeft: theme.spacing(1),
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0.5),
}))