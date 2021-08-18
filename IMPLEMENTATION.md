## gojs-react's Implementation
gojs-react is implemented as a set of React Components with a few different lifecycle methods to handle setup, teardown, and state change management.

### Initializing the GoJS Diagram
#### componentDidMount
The componentDidMount method is responsible for initializing the diagram and any listeners.
It is important that the component be mounted because GoJS requires a DIV to render the diagram canvas.

This is where initial data will be merged into the model. The merges will make deep copies of data using [Model.cloneDeep](https://gojs.net/latest/api/symbols/Model.html#cloneDeep) to prevent GoJS from mutating React state. Note that this will cause the change handler to fire, as there could be side effects during initialization. The call to [Diagram.delayInitialization](https://gojs.net/latest/api/symbols/Diagram.html#delayInitialization)
allows saved link routes to be restored, so it's a good idea to have data ready before the component mounts.

It's important to keep React state up-to-date with any changes that have taken place in the GoJS model.
[Model.toIncrementalData](https://gojs.net/latest/api/symbols/Model.html#toIncrementalData) can be used within a model change listener
in a similar manner to [Model.toIncrementalJson](https://gojs.net/latest/api/symbols/Model.html#toIncrementalJson),
but contains deep copies of model objects rather than stringified JSON. This makes it easy to use to update React state.

Because GoJS Palettes are read-only by default, the ReactPalette component doesn't add a change listener.

```ts
/**
 * Initialize the diagram and add the required listeners.
 */
public componentDidMount() {
  if (this.divRef.current === null) return;
  const diagram = this.props.initDiagram();

  diagram.div = this.divRef.current;

  // initialize data change listener
  this.modelChangedListener = (e: go.ChangedEvent) => {
    if (e.isTransactionFinished && e.model && !e.model.isReadOnly && this.props.onModelChange) {
      const dataChanges = e.model.toIncrementalData(e);
      if (dataChanges !== null) this.props.onModelChange(dataChanges);
    }
  };
  diagram.addModelChangedListener(this.modelChangedListener);

  // delay initialization of the diagram so all initial model data is merged before any animations/layouts
  diagram.delayInitialization(() => {
    this.mergeData(diagram, true);
  });
}
```

### Updating the GoJS Model based on React state changes
When state is updated in React, it is important to keep the GoJS model up-to-date.
The methods used to do this are [Model.mergeNodeDataArray](https://gojs.net/latest/api/symbols/Model.html#mergeNodeDataArray) and
[GraphLinksModel.mergeLinkDataArray](https://gojs.net/latest/api/symbols/GraphLinksModel.html#mergeLinkDataArray).
These methods take arrays of node or link data, iterate over those arrays, and merge any differences into the model.
As with the initial data merge during mount, deep copies of new data will be made
using [Model.cloneDeep](https://gojs.net/latest/api/symbols/Model.html#cloneDeep).

_Properties should not be removed, but rather set to undefined if they are no longer needed; GoJS avoids destructive merging._

#### componentDidUpdate
The componentDidUpdate method calls mergeData where any changes to React state are merged into the GoJS model.

```ts
/**
 * When the component updates, merge all data changes into the GoJS model to ensure everything stays in sync.
 * @param prevProps
 * @param prevState
 */
public componentDidUpdate(prevProps: DiagramProps, prevState: any) {
  const diagram = this.getDiagram();
  if (diagram !== null) {
    // if clear was just called, treat this as initial
    if (this.wasCleared) {
      diagram.delayInitialization(() => {
        this.mergeData(diagram, true);
        this.wasCleared = false;
      });
    } else {
      this.mergeData(diagram, false);
    }
  }
}
```

#### shouldComponentUpdate
The shouldComponentUpdate method is used to perform comparisons between the props passed in to the component.
This is also where one can check the skipsDiagramUpdate prop to prevent known updates.
Because GoJS Palettes are read-only by default, the skipsDiagramUpdate check is not present on ReactPalette.

```ts
/**
 * Determines whether component needs to update by comparing props and checking skipsDiagramUpdate.
 * @param nextProps
 * @param nextState
 */
public shouldComponentUpdate(nextProps: DiagramProps, nextState: any) {
  if (nextProps.skipsDiagramUpdate) return false;
  // quick shallow compare
  if (nextProps.nodeDataArray === this.props.nodeDataArray &&
      nextProps.linkDataArray === this.props.linkDataArray &&
      nextProps.modelData === this.props.modelData) return false;
  return true;
}
```

#### mergeData
The mergeData method is where any changes to React state are merged into the GoJS model. It is called by componentDidMount and componentDidUpdate.

```ts
private mergeData(diagram: go.Diagram, isInit: boolean) {
  const model = diagram.model;
  model.commit((m: go.Model) => {
    if (this.props.modelData !== undefined) {
      m.assignAllDataProperties(m.modelData, this.props.modelData);
    }
    m.mergeNodeDataArray(this.props.nodeDataArray);
    if (this.props.linkDataArray !== undefined && m instanceof go.GraphLinksModel) {
      m.mergeLinkDataArray(this.props.linkDataArray);
    }
  }, isInit ? null : 'merge data');
}
```

### Tearing down the GoJS Diagram
#### componentWillUnmount
The componentWillUnmount method is responsible for tearing down the diagram and all listeners.
It is important to set [Diagram.div](https://gojs.net/latest/api/symbols/Diagram.html#div) to null to remove all references to the diagram, and to remove any listeners.

```ts
/**
 * Disassociate the diagram from the div and remove listeners.
 */
public componentWillUnmount() {
  const diagram = this.getDiagram();
  if (diagram !== null) {
    diagram.div = null;
    if (this.modelChangedListener !== null) {
      diagram.removeModelChangedListener(this.modelChangedListener);
      this.modelChangedListener = null;
    }
  }
}
```
