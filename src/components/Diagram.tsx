/*
*  Copyright (C) 1998-2019 by Northwoods Software Corporation. All Rights Reserved.
*/

import * as go from 'gojs';
import * as React from 'react';

/**
 * Properties passed to the Diagram component.
 */
export interface DiagramProps {
  initDiagram: () => go.Diagram;
  divClassName: string;
  nodeDataArray: Array<go.ObjectData>;
  linkDataArray?: Array<go.ObjectData>;
  modelData?: go.ObjectData;
  skipsDiagramUpdate: boolean;
  onModelChange: (e: go.IncrementalData) => void;
}

/**
 * A Diagram component to allow a GoJS diagram to be used within a React app.
 *
 * Data arrays passed to this component will be deep cloned before usage in a GoJS model, preserving immutability.
 */
export class ReactDiagram extends React.Component<DiagramProps, {}> {
  /** @internal */
  private divRef: React.RefObject<HTMLDivElement>;
  /** @internal */
  private modelChangedListener: ((e: go.ChangedEvent) => void) | null = null;

  /** @internal */
  constructor(props: DiagramProps) {
    super(props);
    this.divRef = React.createRef();
  }

  /**
   * Returns a reference to the GoJS diagram instance for this component.
   */
  public getDiagram(): go.Diagram | null {
    if (this.divRef.current === null) return null;
    return go.Diagram.fromDiv(this.divRef.current);
  }

  /**
   * @internal
   * Initialize the diagram and add the required listeners.
   */
  public componentDidMount() {
    if (this.divRef.current === null) return;
    const diagram = this.props.initDiagram();

    diagram.div = this.divRef.current;
    diagram.delayInitialization(() => {
      const model = diagram.model;
      model.commit((m: go.Model) => {
        m.mergeNodeDataArray(m.cloneDeep(this.props.nodeDataArray));
        if (this.props.linkDataArray !== undefined && m instanceof go.GraphLinksModel) {
          m.mergeLinkDataArray(m.cloneDeep(this.props.linkDataArray));
        }
        if (this.props.modelData !== undefined) {
          m.assignAllDataProperties(m.modelData, this.props.modelData);
        }
      }, null);
    });


    // initialize listeners
    this.modelChangedListener = (e: go.ChangedEvent) => {
      if (e.isTransactionFinished) {
        const dataChanges = e.model!.toIncrementalData(e);
        if (dataChanges !== null) this.props.onModelChange(dataChanges);
      }
    };
    diagram.addModelChangedListener(this.modelChangedListener);
  }

  /**
   * @internal
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

  /**
   * @internal
   * Determines whether component needs to update by checking the skips flag and doing a shallow compare on props.
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

  /**
   * @internal
   * When the component updates, merge all data changes into the GoJS model to ensure everything stays in sync.
   * The model change listener is removed during this update since the data changes are already known by the parent.
   * @param prevProps
   * @param prevState
   */
  public componentDidUpdate(prevProps: DiagramProps, prevState: any) {
    const diagram = this.getDiagram();
    if (diagram !== null) {
      const model = diagram.model;
      // don't need model change listener while performing known data updates
      if (this.modelChangedListener !== null) model.removeChangedListener(this.modelChangedListener);
      model.startTransaction('update data');
      model.mergeNodeDataArray(model.cloneDeep(this.props.nodeDataArray));
      if (this.props.linkDataArray !== undefined && model instanceof go.GraphLinksModel) {
        model.mergeLinkDataArray(model.cloneDeep(this.props.linkDataArray));
      }
      if (this.props.modelData !== undefined) {
        model.assignAllDataProperties(model.modelData, this.props.modelData);
      }
      model.commitTransaction('update data');
      if (this.modelChangedListener !== null) model.addChangedListener(this.modelChangedListener);
    }
  }

  /** @internal */
  public render() {
    return (<div ref={this.divRef} className={this.props.divClassName}></div>);
  }
}
