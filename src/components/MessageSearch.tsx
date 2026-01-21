import { useState, useEffect } from 'react'
import { TextField, InputAdornment, IconButton } from '@mui/material'
import { Search, Clear } from '@mui/icons-material'
import { useSessionStore } from '../stores/sessionStore'
import { styled } from '@mui/material/styles'

export const MessageSearch = () => {
  const { searchQuery, setSearchQuery } = useSessionStore()
  const [localQuery, setLocalQuery] = useState(searchQuery)

  // Sync local state with store
  useEffect(() => {
    setLocalQuery(searchQuery)
  }, [searchQuery])

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value
    setLocalQuery(query)
    setSearchQuery(query)
  }

  const handleClearSearch = () => {
    setLocalQuery('')
    setSearchQuery('')
  }

  return (
    <SearchContainer>
      <TextField
        fullWidth
        variant="outlined"
        size="small"
        placeholder="Search messages..."
        value={localQuery}
        onChange={handleSearchChange}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search color="action" />
            </InputAdornment>
          ),
          endAdornment: localQuery && (
            <InputAdornment position="end">
              <IconButton
                size="small"
                onClick={handleClearSearch}
                edge="end"
              >
                <Clear fontSize="small" />
              </IconButton>
            </InputAdornment>
          )
        }}
      />
    </SearchContainer>
  )
}

const SearchContainer = styled('div')(({ theme }) => ({
  padding: theme.spacing(2),
  backgroundColor: theme.palette.background.default,
  borderBottom: `1px solid ${theme.palette.divider}`,
  position: 'sticky',
  top: 0,
  zIndex: 10,
}))