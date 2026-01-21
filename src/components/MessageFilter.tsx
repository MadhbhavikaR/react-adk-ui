import { useState } from 'react'
import { Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, FormGroup, FormControlLabel, Checkbox, Box, Typography } from '@mui/material'
import { FilterList } from '@mui/icons-material'
import { useSessionStore } from '../stores/sessionStore'
import { styled } from '@mui/material/styles'

export const MessageFilter = () => {
  const { filters, setFilters, clearFilters } = useSessionStore()
  const [open, setOpen] = useState(false)

  const roleOptions = ['user', 'bot', 'system', 'tool', 'function']
  const statusOptions = ['sent', 'delivered', 'read', 'error']
  const typeOptions = ['normal', 'error', 'warning', 'system', 'success']

  const handleOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)

  const handleRoleChange = (role: string) => {
    setFilters({
      roles: filters.roles.includes(role) 
        ? filters.roles.filter(r => r !== role)
        : [...filters.roles, role]
    })
  }

  const handleStatusChange = (status: string) => {
    setFilters({
      statuses: filters.statuses.includes(status) 
        ? filters.statuses.filter(s => s !== status)
        : [...filters.statuses, status]
    })
  }

  const handleTypeChange = (type: string) => {
    setFilters({
      types: filters.types.includes(type) 
        ? filters.types.filter(t => t !== type)
        : [...filters.types, type]
    })
  }

  const activeFiltersCount = filters.roles.length + filters.statuses.length + filters.types.length

  return (
    <>
      <FilterButton onClick={handleOpen} aria-label="Filter messages">
        <FilterList fontSize="small" />
        {activeFiltersCount > 0 && (
          <FilterBadge>{activeFiltersCount}</FilterBadge>
        )}
      </FilterButton>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Filter Messages</DialogTitle>
        <DialogContent dividers>
          <FilterSection>
            <Typography variant="subtitle2" gutterBottom>Roles</Typography>
            <FormControl component="fieldset">
              <FormGroup row>
                {roleOptions.map((role) => (
                  <FormControlLabel
                    key={role}
                    control={
                      <Checkbox
                        checked={filters.roles.includes(role)}
                        onChange={() => handleRoleChange(role)}
                        name={role}
                      />
                    }
                    label={role}
                  />
                ))}
              </FormGroup>
            </FormControl>
          </FilterSection>

          <FilterSection>
            <Typography variant="subtitle2" gutterBottom>Statuses</Typography>
            <FormControl component="fieldset">
              <FormGroup row>
                {statusOptions.map((status) => (
                  <FormControlLabel
                    key={status}
                    control={
                      <Checkbox
                        checked={filters.statuses.includes(status)}
                        onChange={() => handleStatusChange(status)}
                        name={status}
                      />
                    }
                    label={status}
                  />
                ))}
              </FormGroup>
            </FormControl>
          </FilterSection>

          <FilterSection>
            <Typography variant="subtitle2" gutterBottom>Types</Typography>
            <FormControl component="fieldset">
              <FormGroup row>
                {typeOptions.map((type) => (
                  <FormControlLabel
                    key={type}
                    control={
                      <Checkbox
                        checked={filters.types.includes(type)}
                        onChange={() => handleTypeChange(type)}
                        name={type}
                      />
                    }
                    label={type}
                  />
                ))}
              </FormGroup>
            </FormControl>
          </FilterSection>
        </DialogContent>
        <DialogActions>
          <Button onClick={clearFilters} color="secondary">
            Clear All
          </Button>
          <Button onClick={handleClose} variant="contained">
            Apply
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

const FilterButton = styled(Button)(({ theme }) => ({
  minWidth: 'auto',
  padding: theme.spacing(1),
  marginLeft: theme.spacing(1),
}))

const FilterBadge = styled('span')(({ theme }) => ({
  marginLeft: theme.spacing(0.5),
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  borderRadius: '10px',
  padding: '2px 6px',
  fontSize: '0.75rem',
  fontWeight: 'bold',
}))

const FilterSection = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  paddingBottom: theme.spacing(2),
  borderBottom: `1px solid ${theme.palette.divider}`,
}))