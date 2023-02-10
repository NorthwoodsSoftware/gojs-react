# gojs-react

### By Northwoods Software for [GoJS](https://gojs.net)

This project provides React components for [GoJS](https://gojs.net/latest/index.html) Diagrams, Palettes, and Overviews to simplify usage of GoJS within a React application.
See the [gojs-react-basic project](https://github.com/NorthwoodsSoftware/gojs-react-basic) for example usage and the
[Intro page on using GoJS with React](https://gojs.net/latest/intro/react.html) for more information.
Some more detail on the implementation of these components can be found [here](https://github.com/NorthwoodsSoftware/gojs-react/blob/master/IMPLEMENTATION.md).

[![npm](https://img.shields.io/github/release/NorthwoodsSoftware/gojs-react.svg)](https://www.npmjs.com/package/gojs-react)
[![open issues](https://img.shields.io/github/issues-raw/NorthwoodsSoftware/gojs-react.svg)](https://github.com/NorthwoodsSoftware/gojs-react/issues)

## Installation

gojs-react can be installed via NPM or used via CDN. This package has peer dependencies on GoJS and React, so make sure those are also installed or included on your page.

### NPM

```bash
npm install --save gojs-react
```

### CDN

```html
<script src="https://unpkg.com/gojs-react/dist/gojsreact.production.min.js"></script>
```

## Usage

This package provides three components - ReactDiagram, ReactPalette, and ReactOverview - corresponding to the related GoJS classes.
The [gojs-react-basic repository](https://github.com/NorthwoodsSoftware/gojs-react-basic) provides example usage.
Feel free to use these components as examples for setting up your own React components for GoJS.
If you'd like to do so, we suggest reading more about the implementation of these components [here](https://github.com/NorthwoodsSoftware/gojs-react/blob/master/IMPLEMENTATION.md).

```tsx
<ReactDiagram
  ref={this.diagramRef}
  divClassName='diagram-component'
  style={{ backgroundColor: '#eee' }}
  initDiagram={this.initDiagram}
  nodeDataArray={this.props.nodeDataArray}
  linkDataArray={this.props.linkDataArray}
  modelData={this.props.modelData}
  onModelChange={this.props.onModelChange}
  skipsDiagramUpdate={this.props.skipsDiagramUpdate}
/>

<ReactPalette
  initPalette={this.initPalette}
  divClassName='palette-component'
  style={{ backgroundColor: '#eee' }}
  nodeDataArray={[{ key: 0, text: 'Alpha' }]}
/>

<ReactOverview
  initOverview={this.initOverview}
  divClassName='overview-component'
  style={{ backgroundColor: '#eee' }}
  observedDiagram={this.state.observed}
/>
```

### Component Props

#### initDiagram/initPalette/initOverview
Specifies a function that is reponsible for initializing and returning
a GoJS Diagram, Palette, or Overview. This is where the model and templates
should be instantiated. Node and link data do not need to be set up here,
as they will be passed in as separate props.

In the case of an Overview, this is an optional property and when not provided,
an Overview with default properties and centered content will be created.

```js
function initDiagram() {
  const $ = go.GraphObject.make;

  const diagram = $(go.Diagram,
    {
      'undoManager.isEnabled': true,  // must be set to allow for model change listening
      // 'undoManager.maxHistoryLength': 0,  // uncomment disable undo/redo functionality
      model: $(go.GraphLinksModel, {
        linkKeyProperty: 'key'  // this should always be set when using a GraphLinksModel
      })
    });

  diagram.nodeTemplate =
    $(go.Node, 'Auto',  // the Shape will go around the TextBlock
      $(go.Shape, 'RoundedRectangle', { strokeWidth: 0, fill: 'white' },
        // Shape.fill is bound to Node.data.color
        new go.Binding('fill', 'color')),
      $(go.TextBlock,
        { margin: 8 },  // some room around the text
        // TextBlock.text is bound to Node.data.key
        new go.Binding('text', 'key'))
    );

  return diagram;
}
```

#### divClassName
Specifies the CSS classname to add to the rendered div.
This should usually specify a width/height.

```css
.diagram-component {
  width: 400px;
  height: 400px;
  border: 1px solid black;
}
```

#### Optional - style
Specifies the style object to add to the rendered div. Uses React.CSSProperties. Using divClassName is preferred.

```js
style: { backgroundColor: '#333' }
```

#### nodeDataArray (ReactDiagram and ReactPalette only)
Specifies the array of nodes for the Diagram's model.

_Properties should not be removed when setting state, but rather set to undefined if they are no longer needed; GoJS avoids destructive merging._

```js
nodeDataArray: [
  { key: 'Alpha', color: 'lightblue' },
  { key: 'Beta', color: 'orange' },
  { key: 'Gamma', color: 'lightgreen' },
  { key: 'Delta', color: 'pink' }
]
```

#### Optional - linkDataArray (ReactDiagram and ReactPalette only)
Specifies the array of links for the Diagram's model, only needed when using a GraphLinksModel,
not for Models or TreeModels. If using a GraphLinksModel, make sure to set the GraphLinksModel's
linkKeyProperty in the init function.

_Properties should not be removed when setting state, but rather set to undefined if they are no longer needed; GoJS avoids destructive merging._

```js
linkDataArray: [
  { key: -1, from: 'Alpha', to: 'Beta' },
  { key: -2, from: 'Alpha', to: 'Gamma' },
  { key: -3, from: 'Beta', to: 'Beta' },
  { key: -4, from: 'Gamma', to: 'Delta' },
  { key: -5, from: 'Delta', to: 'Alpha' }
]
```

#### Optional - modelData (ReactDiagram and ReactPalette only)
Specifies a modelData object for the Diagram's model, only necessary when using properties
that will be shared by the model as a whole.
See [Model.modelData](https://gojs.net/latest/api/symbols/Model.html#modelData).

#### Optional - skipsDiagramUpdate (ReactDiagram only)
Specifies whether the component should skip updating, often set to true when updating state originating from a GoJS model change.
This flag is checked during shouldComponentUpdate. Because GoJS Palettes are read-only by default,
this prop is not present on ReactPalette.

#### Optional - onModelChange (ReactDiagram only)
Specifies a function to be called when a GoJS transaction has completed.
This function will typically be responsible for updating React/Redux state.

It is important that state updates made in this function include setting skipsDiagramUpdate to true since
the changes are known by GoJS. It will fire even when a GoJS change originated from a state update, as there
could be side effects that occur in GoJS. It's a good idea to properly filter out any unnecessary changes
before updating state.

Because GoJS Palettes are read-only by default, this prop is not present on ReactPalette.
Although there won't be user-driven changes to a Palette's model due to the read-only nature of Palettes,
changes to the nodeDataArray, linkDataArray, or modelData props described above
allow for a Palette's model to be changed, if necessary.

```js
function handleModelChange(data) {
  const insertedNodeKeys = data.insertedNodeKeys;
  const modifiedNodeData = data.modifiedNodeData;
  const removedNodeKeys = data.removedNodeKeys;
  const insertedLinkKeys = data.insertedLinkKeys;
  const modifiedLinkData = data.modifiedLinkData;
  const removedLinkKeys = data.removedLinkKeys;

  // ... make state changes
}
```

#### observedDiagram (ReactOverview only)
Specifies the go.Diagram which the Overview will observe.

### Component Methods

#### getDiagram/getPalette/getOverview
Gets a reference to the GoJS Diagram/Palette/Overview.

```ts
const diagram = this.diagramRef.current.getDiagram();
if (diagram instanceof go.Diagram) {
  // ...
}
```

#### clear (ReactDiagram and ReactPalette only)
Clears the diagram and allows the next update to be treated as an initial load of the model.

```ts
// clear out the diagram
this.diagramRef.current.clear();
// provide new diagram data, which will be treated as initial data
this.setState({
  nodeDataArray: [
    { key: 'Epsilon', color: 'lightblue' },
    { key: 'Zeta', color: 'orange' },
    { key: 'Eta', color: 'lightgreen' },
    { key: 'Theta', color: 'pink' }
  ],
  linkDataArray: [
    { key: -1, from: 'Epsilon', to: 'Zeta' },
    { key: -2, from: 'Epsilon', to: 'Eta' },
    { key: -3, from: 'Zeta', to: 'Zeta' },
    { key: -4, from: 'Zeta', to: 'Theta' },
    { key: -5, from: 'Theta', to: 'Epsilon' }
  ]
});
```

## License

This project is intended to be used alongside [GoJS](https://gojs.net/latest/index.html),
and is covered by the GoJS <a href="https://gojs.net/latest/license.html">software license</a>.

Copyright 1998-2023 by Northwoods Software Corporation.
