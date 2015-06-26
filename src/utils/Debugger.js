/*eslint-disable */
import React, { Component } from 'react'
import Alt from '../'
import { Column, Table } from 'fixed-data-table'
import makeFinalStore from './makeFinalStore'
import connectToStores from './connectToStores'
import { DragSource, DragDropContext } from 'react-dnd'
import HTML5Backend from 'react-dnd/modules/backends/HTML5'

import assign from 'object-assign'

//import DispatcherDebugger from './DispatcherDebugger'

const alt = new Alt()

const actions = alt.generateActions(
  'addDispatch',
  'clear',
  'loadRecording',
  'replay',
  'revert',
  'saveRecording',
  'selectDispatch',
  'setAlt',
  'startReplay',
  'stopReplay',
  'togglePauseReplay',
  'toggleRecording'
)

const DispatcherStore = alt.createStore(class {
  static config = {
    getState(state) {
      return {
        currentStateId: state.currentStateId,
        dispatches: state.dispatches,
        inReplayMode: state.nextReplayId !== null,
        isRecording: state.isRecording,
        isReplaying: state.isReplaying,
        mtime: state.mtime,
        selectedDispatch: state.selectedDispatch,
      }
    }
  }

  constructor() {
    this.cachedDispatches = []
    this.dispatches = []
    this.selectedDispatch = {}
    this.currentStateId = null
    this.snapshots = {}
    this.alt = null
    this.stores = []
    this.replayTime = 100
    this.isRecording = true
    this.isReplaying = false
    this.nextReplayId = null

    // due to the aggressive nature of FixedDataTable's shouldComponentUpdate
    // and JS objects being references not values we need an mtime applied
    // to each dispatch so we know when data has changed
    this.mtime = Date.now()

    this.on('beforeEach', () => {
      this.mtime = Date.now()
    })

    this.bindActions(actions)
  }

  addDispatch(payload) {
    if (!this.isRecording) return false

    const dispatchedStores = this.stores
      .filter((x) => x.boundListeners.indexOf(payload.action) > -1)
      .map((x) => x.name)
      .join(', ')

    payload.dispatchedStores = dispatchedStores

    this.dispatches.unshift(payload)

    if (this.alt) this.snapshots[payload.id] = this.alt.takeSnapshot()
    this.currentStateId = payload.id
  }

  clear() {
    this.dispatches = []
    this.selectedDispatch = {}
    this.currentStateId = null
    this.nextReplayId = null
    this.snapshots = {}
    this.alt.recycle()
  }

  loadRecording(events) {
    this.clear()
    const wasRecording = this.isRecording
    this.isRecording = true
    const dispatches = JSON.parse(events)
    dispatches.reverse().forEach((dispatch) => {
      setTimeout(() => {
        this.alt.dispatch(dispatch.action, dispatch.data, dispatch.details)
      }, 0)
    })
    this.isRecording = wasRecording
  }

  replay() {
    if (!this.isReplaying) return false

    const dispatch = this.cachedDispatches[this.nextReplayId]
    setTimeout(() => {
      this.alt.dispatch(dispatch.action, dispatch.data, dispatch.details)
    }, 0)

    this.nextReplayId = this.nextReplayId - 1

    if (this.nextReplayId >= 0) {
      setTimeout(() => actions.replay(), this.replayTime)
    } else {
      this.isReplaying = false
      this.nextReplayId = null
    }
  }

  revert(id) {
    const snapshot = this.snapshots[id]
    if (snapshot) {
      this.currentStateId = id
      this.alt.bootstrap(snapshot)
    }
  }

  saveRecording() {
    console.log(JSON.stringify(this.dispatches))
  }

  selectDispatch(dispatch) {
    this.selectedDispatch = dispatch
  }

  setAlt(alt) {
    this.alt = alt
    this.stores = Object.keys(this.alt.stores).map((name) => {
      return this.alt.stores[name]
    })
  }

  startReplay() {
    this.cachedDispatches = this.dispatches.slice()
    this.clear()
    this.nextReplayId = this.cachedDispatches.length - 1
    this.isReplaying = true
  }

  stopReplay() {
    this.cachedDispatches = []
    this.nextReplayId = null
    this.isReplaying = false
  }

  togglePauseReplay() {
    this.isReplaying = !this.isReplaying
  }

  toggleRecording() {
    this.isRecording = !this.isRecording
  }
}, 'DispatcherStore')

class FixedDataTableCSS extends Component {
  componentShouldUpdate() {
    return false
  }

  render() {
    return (
      <link
        rel="stylesheet"
        type="text/css"
        href="node_modules/fixed-data-table/dist/fixed-data-table.min.css"
      />
    )
  }
}

const DispatcherDebugger = DragSource('DispatcherDebugger', {
  beginDrag(props) {
    return props
  }
}, (connect, monitor) => {
  return {
    connect: connect.dragSource()
  }
})(class extends Component {
  constructor() {
    super()

    this.getDispatch = this.getDispatch.bind(this)
    this.renderName = this.renderName.bind(this)
    this.renderReplay = this.renderReplay.bind(this)
    this.renderRevert = this.renderRevert.bind(this)
    this.view = this.view.bind(this)
  }

  clear() {
    actions.clear()
  }

  getDispatch(idx) {
    const dispatch = this.props.dispatches[idx]
    return {
      id: dispatch.id,
      action: dispatch.action,
      data: dispatch.data,
      details: dispatch.details,
      recorded: dispatch.recorded,
      dispatchedStores: dispatch.dispatchedStores,
      mtime: this.props.mtime,
    }
  }

  loadRecording() {
    const json = prompt('Give me a serialized recording')
    if (json) actions.loadRecording(json)
  }

  revert(ev) {
    const data = ev.target.dataset
    actions.revert(data.dispatchId)
  }

  saveRecording() {
    actions.saveRecording()
  }

  startReplay() {
    actions.startReplay()
    actions.replay()
  }

  stopReplay() {
    actions.stopReplay()
  }

  toggleLogDispatches() {
    actions.toggleLogDispatches()
  }

  togglePauseReplay() {
    actions.togglePauseReplay()
  }

  toggleRecording() {
    actions.toggleRecording()
  }

  view(ev) {
    const data = ev.target.dataset
    const dispatch = this.props.dispatches[data.index]
    if (this.props.inspector) {
      actions.selectDispatch(dispatch)
    } else {
      console.log(dispatch)
    }
  }

  renderName(name, _, dispatch, idx) {
    return (
      <div
        data-index={idx}
        onClick={this.view}
        style={{ cursor: 'pointer' }}
      >
        {name}
      </div>
    )
  }

  renderReplay() {
    if (this.props.inReplayMode) {
      return (
        <span>
          <span onClick={this.togglePauseReplay}>
            {this.props.isReplaying ? 'Pause Replay' : 'Resume Replay'}
          </span>
          {' | '}
          <span onClick={this.stopReplay}>
            Stop Replay
          </span>
        </span>
      )
    }

    return (
      <span onClick={this.startReplay}>
        Start Replay
      </span>
    )
  }

  renderRevert(a, b, dispatch) {
    return (
      <div>
        <span
          data-dispatch-id={dispatch.id}
          onClick={this.revert}
          style={{ cursor: 'pointer' }}
        >
          Revert
        </span>
        <span dangerouslySetInnerHTML={{
          __html: this.props.currentStateId === dispatch.id ? '&#10003;' : ''
        }} />
      </div>
    )
  }

  render() {
    return (
      <div>
        <div>
          <span onClick={this.toggleRecording}>
            {this.props.isRecording ? 'Stop Recording' : 'Record'}
          </span>
          {' | '}
          <span onClick={this.clear}>
            Clear
          </span>
          {' | '}
          <span onClick={this.saveRecording}>
            {this.props.dispatches.length ? 'Save' : ''}
          </span>
          {' | '}
          <span onClick={this.loadRecording}>
            Load
          </span>
          {' | '}
          {this.renderReplay()}
        </div>
        <Table
          headerHeight={30}
          height={480}
          rowGetter={this.getDispatch}
          rowHeight={30}
          rowsCount={this.props.dispatches.length}
          width={320}
        >
          <Column
            cellRenderer={this.renderName}
            dataKey="action"
            label="Name"
            width={250}
          />
          <Column
            cellRenderer={this.renderRevert}
            dataKey=""
            label="Revert"
            width={70}
          />
        </Table>
      </div>
    )
  }
})

// XXX this can be the DispatcherDebugger
// we can also have a StoreDebugger
// we can also have a DebuggingTools which has flush, bootstrap, etc
// and a main Debugger which gives us access to everything
class Debugger extends Component {
  componentDidMount() {
    const finalStore = makeFinalStore(this.props.alt)
    finalStore.listen((state) => {
      actions.addDispatch(state.payload)
    })

    actions.setAlt(this.props.alt)
  }

  renderInspectorWindow() {
    return this.props.inspector
      ? <this.props.inspector data={this.props.selectedDispatch} />
      : null
  }

  render() {
    // XXX I think I should connect the inspector window otherwise make it
    // console.log
    //
    // this way we connect DispatcherDebugger to the AltStore so that is the
    // only thing that re-renders
    return (
      <div>
        <FixedDataTableCSS />
        <DispatcherDebugger {...this.props} />
        {this.renderInspectorWindow()}
      </div>
    )
  }
}

export default connectToStores({
  getPropsFromStores() {
    return DispatcherStore.getState()
  },

  getStores() {
    return [DispatcherStore]
  }
}, DragDropContext(HTML5Backend)(Debugger))
