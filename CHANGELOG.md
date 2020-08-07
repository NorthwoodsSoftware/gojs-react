# gojs-react Change Log

## 1.0.8
- Node and link data arrays are no longer deep cloned prior to calling the merge methods as the merge methods now clone any
new data as necessary.

## 1.0.7
- The GoJS model change listener is now active during model initialization and any merges of data.
This means all changes that take place in GoJS - including side effects like laying out newly added nodes -
will call the [onModelChange](https://github.com/NorthwoodsSoftware/gojs-react#onmodelchange-reactdiagram-only) handler.
Make sure to set [skipsDiagramUpdate](https://github.com/NorthwoodsSoftware/gojs-react#skipsdiagramupdate-reactdiagram-only)
to true when making state updates in that handler.
