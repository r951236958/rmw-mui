import Checkbox from '@material-ui/core/Checkbox'
import Divider from '@material-ui/core/Divider'
import ListItem from '@material-ui/core/ListItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemText from '@material-ui/core/ListItemText'
import React, { useEffect } from 'react'
import VirtualList from 'material-ui-shell/lib/containers/VirtualList'
import { useFilter } from 'material-ui-shell/lib/providers/Filter'
import { useLists } from 'rmw-shell/lib/providers/Firebase/Lists'

export default function ({ path }) {
  const { firebaseApp, watchList, getList: getFirebaseList } = useLists()
  const { getList } = useFilter()

  const roles = getFirebaseList('roles')
  const userRoles = getFirebaseList(path)

  const list = getList(
    'roles',
    roles.map((r) => {
      return { key: r.key, ...r.val }
    }),
    [{ name: 'name' }]
  )

  useEffect(() => {
    watchList('roles')
    watchList(path)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path])

  const Row = ({ index, style, data }) => {
    const { key, name = '' } = data

    let isSelected = false

    userRoles.map((rg) => {
      if (rg.key === key) {
        isSelected = true
      }

      return rg
    })

    return (
      <div key={`${name}_${index}`} style={style}>
        <ListItem
          button
          alignItems="flex-start"
          onClick={async () => {
            await firebaseApp
              .database()
              .ref(`${path}/${key}`)
              .set(isSelected ? null : true)
          }}
        >
          <ListItemIcon>
            <Checkbox
              edge="start"
              checked={isSelected}
              tabIndex={-1}
              disableRipple
            />
          </ListItemIcon>
          <ListItemText primary={name} secondary={name} />
        </ListItem>
        <Divider />
      </div>
    )
  }

  return (
    <VirtualList
      list={list}
      name="roles"
      listProps={{ itemSize: 72 }}
      Row={Row}
    />
  )
}
