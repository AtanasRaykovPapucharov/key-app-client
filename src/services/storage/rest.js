import { api } from 'boot/axios'

// all tables
export const getTables = async () => {
  const res = await api.get('/admin/tables', { withCredentials: true })
  return res?.data?.tables?.map((t) => ({ label: t.toUpperCase(), value: t })) || []
}

// tables
export const createTable = async (tableName) =>
  await api.post(`/admin/table`, { tableName }, { withCredentials: true })

export const dropTable = async (tableName) =>
  await api.delete(`/admin/table/${tableName}`, {}, { withCredentials: true })

export const getTableColumns = async (tableName) => {
  let res = await api.get(`/admin/${tableName}`, {}, { withCredentials: true })

  return res?.data?.cols || []
}
export const getTableData = async (tableName) => {
  const res = await api.get(`/${tableName}`, {}, { withCredentials: true })
  return res?.data || []
}

// rows
export const addTblRow = async (tableName, row) =>
  await api.post(`/${tableName}`, { tableName, row }, { withCredentials: true })

export const editTblRow = async (tableName, row) =>
  await api.put(`/${tableName}`, { tableName, row }, { withCredentials: true })

export const deleteTblRow = async (tableName, tableId) =>
  await api.delete(`/${tableName}/${tableId}`, {}, { withCredentials: true })

// cols
export const addColumn = async (table, column, type) => {
  await api.post(`/admin/column`, { table, column, type }, { withCredentials: true })
}

export const deleteColumn = async (table, column) => {
  await api.delete(`/admin/column/${table}/${column}`, {}, { withCredentials: true })
}
