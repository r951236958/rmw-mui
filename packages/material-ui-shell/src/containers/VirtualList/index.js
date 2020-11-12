import AutoSizer from 'react-virtualized-auto-sizer'
import List from '@material-ui/core/List'
import React, { useEffect } from 'react'
import Scrollbar from 'material-ui-shell/lib/components/Scrollbar'
import { FixedSizeList } from 'react-window'
import { useState } from 'react'
import { useVirtualLists } from 'material-ui-shell/lib/providers/VirtualLists'

const CustomScrollbarsVirtualList = React.forwardRef((props, ref) => {
  const { style, ...rest } = props
  return (
    <Scrollbar
      {...rest}
      forwardedRef={ref}
      style={{ ...style, overflow: 'hidden' }}
    />
  )
})

export default function (props) {
  const { list = [], listProps, Row, name, preserveScroll = true } = props
  const listRef = React.createRef()
  const [ref, setRef] = useState(false)
  const { getOffset, setOffset } = useVirtualLists()

  useEffect(() => {
    const scrollOffset = getOffset(name)
    if (preserveScroll && ref && scrollOffset) {
      listRef.current.scrollTo(scrollOffset)
    }

    return () => {
      try {
        if (preserveScroll && listRef.current) {
          const offset = listRef.current.state.scrollOffset
          setOffset(name, offset)
        }
      } catch (error) {
        console.warn('Could not save scrollOffset', error)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref])

  return (
    <AutoSizer style={{ height: '100%', width: '100%' }}>
      {({ height, width }) => {
        return (
          <List style={{ padding: 0 }}>
            <FixedSizeList
              ref={(r) => {
                if (r) {
                  listRef.current = r
                  setRef(true)
                }
              }}
              height={height}
              itemCount={list.length}
              width={width}
              outerElementType={CustomScrollbarsVirtualList}
              {...listProps}
            >
              {(p) => <Row {...p} data={list[p.index]} />}
            </FixedSizeList>
          </List>
        )
      }}
    </AutoSizer>
  )
}
