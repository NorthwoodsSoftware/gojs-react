/*! Copyright (C) 1998-2024 by Northwoods Software Corporation. All Rights Reserved. */

import * as go from 'gojs';
import * as React from 'react';

/**
 * Properties passed to the Diagram component.
 */
export interface DiagramProps {
  initDiagram: () => go.Diagram;
  divClassName: string;
  style?: React.CSSProperties;
  nodeDataArray: Array<go.ObjectData>;
  linkDataArray?: Array<go.ObjectData>;
  modelData?: go.ObjectData;
  skipsDiagramUpdate?: boolean;
  onModelChange?: (e: go.IncrementalData) => void;
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
  private wasCleared: boolean = false;
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
   * Clears the diagram and allows the next update to be treated as an initial load of the model.
   */
  public clear(): void {
    const diagram = this.getDiagram();
    if (diagram !== null) {
      diagram.clear();
      this.wasCleared = true;
    }
  }

  /**
   * @internal
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

    diagram.delayInitialization(() => {
      this.mergeData(diagram, true);
    });
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
    if (nextProps.divClassName !== this.props.divClassName || nextProps.style !== this.props.style) return true;
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
   * @param prevProps
   * @param prevState
   */
  public componentDidUpdate(prevProps: DiagramProps, prevState: any) {
    // quick shallow compare, maybe it was just a style update
    if (prevProps.nodeDataArray === this.props.nodeDataArray &&
        prevProps.linkDataArray === this.props.linkDataArray &&
        prevProps.modelData === this.props.modelData) return;
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

  /**
   * @internal
   * Merge data props into the diagram model.
   * @param diagram
   * @param isInit
   */
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
    }, isInit ? 'initial merge' : 'merge data');
  }

  /** @internal */
  public render() {
    return (<div ref={this.divRef} className={this.props.divClassName} style={this.props.style}></div>);
  }
}
