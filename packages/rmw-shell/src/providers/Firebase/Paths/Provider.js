import PropTypes from 'prop-types'
import React, { useEffect, useReducer, useCallback } from 'react'
import Context from './Context'

function reducer(state, action) {
  const {
    type,
    path,
    value,
    isLoading = false,
    error = false,
    hasError = false,
  } = action
  switch (type) {
    case 'loading_changed':
      return { ...state, [path]: { ...state[path], isLoading } }
    case 'error_changed':
      return {
        ...state,
        [path]: { ...state[path], error, hasError, isLoading },
      }
    case 'value_changed':
      return {
        ...state,
        [path]: { ...state[path], value, isLoading, error, hasError },
      }
    case 'clear':
      const { [path]: clearedKey, ...rest } = state
      return { ...rest }
    case 'clear_all':
      return {}
    default:
      throw new Error()
  }
}

function getInitState(persistKey) {
  let persistedValues = {}
  try {
    persistedValues = JSON.parse(localStorage.getItem(persistKey)) || {}
  } catch (error) {
    console.warn(error)
  }
  return persistedValues
}

const Provider = ({ children, firebaseApp, persistKey = 'firebase_paths' }) => {
  const [state, dispatch] = useReducer(reducer, getInitState(persistKey))

  useEffect(() => {
    try {
      localStorage.setItem(persistKey, JSON.stringify(state))
    } catch (error) {
      console.warn(error)
    }
  }, [state, persistKey])

  const watchPath = useCallback(
    (path, onChange) => {
      if (path.length < 1) {
        return
      }
      dispatch({
        type: 'loading_changed',
        path,
        isLoading: true,
      })

      firebaseApp
        .database()
        .ref(path)
        .on(
          'value',
          (snapshot) => {
            dispatch({
              type: 'value_changed',
              path,
              value: snapshot.val(),
              isLoading: false,
            })

            if (onChange) {
              onChange(snapshot.val())
            }
          },
          (error) => {
            dispatch({
              type: 'error_changed',
              path,
              isLoading: false,
              error,
              hasError: true,
            })
          }
        )
    },
    [firebaseApp]
  )

  const unwatchPath = useCallback(
    (path) => {
      if (path.length < 1) {
        return
      }
      firebaseApp.database().ref(path).off()
    },
    [firebaseApp]
  )

  const getPath = useCallback(
    (path, defaultValue) => {
      return state[path] ? state[path].value : defaultValue
    },
    [state]
  )

  const isPathLoading = useCallback(
    (path) => {
      return state[path] ? state[path].isLoading : false
    },
    [state]
  )

  const getPathError = useCallback(
    (path) => {
      return state[path] ? state[path].error : false
    },
    [state]
  )

  const hasPathError = useCallback(
    (path) => {
      return state[path] ? state[path].hasError : false
    },
    [state]
  )

  const clearPath = useCallback(
    (path) => {
      unwatchPath(path)
      dispatch({ type: 'clear', path })
    },
    [unwatchPath]
  )

  const clearAllPaths = useCallback(() => {
    firebaseApp.database().ref().off()
    dispatch({ type: 'clear_all' })
  }, [firebaseApp])

  return (
    <Context.Provider
      value={{
        firebaseApp,
        watchPath,
        unwatchPath,
        getPath,
        clearPath,
        clearAllPaths,
        isPathLoading,
        hasPathError,
        getPathError,
      }}
    >
      {children}
    </Context.Provider>
  )
}

Provider.propTypes = {
  children: PropTypes.any,
  firebaseApp: PropTypes.any,
}

export default Provider
