# gojs-react Change Log

## 1.1.1
- Fixed a regression from 1.1.0 that prevented onModelChange from being called for an initial data merge.
- Added an optional [style](https://github.com/NorthwoodsSoftware/gojs-react#optional---style) property to allow the rendered div to be styled with CSS properties like borders, backgrounds, etc.

## 1.1.0
- [ReactDiagram.skipsDiagramUpdate](https://github.com/NorthwoodsSoftware/gojs-react#optional---skipsdiagramupdate-reactdiagram-only) is now an optional prop.
We still encourage using it in most cases.
- Added [clear](https://github.com/NorthwoodsSoftware/gojs-react#clear-reactdiagram-and-reactpalette-only) method to allow clearing of the diagram and treating the next state update as a Diagram reinitialization.

## 1.0.10
- Model data is now merged into the GoJS model before node and link data in case any ofModel bindings depend upon it.

## 1.0.9
- [ReactDiagram.onModelChange](https://github.com/NorthwoodsSoftware/gojs-react#optional---onmodelchange-reactdiagram-only) is now an optional prop. If not provided, GoJS's [Model.toIncrementalData](https://gojs.net/latest/api/symbols/Model.html#toIncrementalData) will not be called.
This is useful for read-only/immutable diagrams or diagrams where state changes need not be propagated back to the app.

## 1.0.8
- Node and link data arrays are no longer deep cloned prior to calling the merge methods as the merge methods now clone any
new data as necessary.

## 1.0.7
- The GoJS model change listener is now active during model initialization and any merges of data.
This means all changes that take place in GoJS - including side effects like laying out newly added nodes -
will call the [onModelChange](https://github.com/NorthwoodsSoftware/gojs-react#optional---onmodelchange-reactdiagram-only) handler.
Make sure to set [skipsDiagramUpdate](https://github.com/NorthwoodsSoftware/gojs-react#optional---skipsdiagramupdate-reactdiagram-only)
to true when making state updates in that handler.
