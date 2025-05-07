/*
*  Copyright (C) 1998-2025 by Northwoods Software Corporation. All Rights Reserved.
*/

import * as go from 'gojs';
import * as React from 'react';

/**
 * Properties passed to the Palette component.
 */
export interface PaletteProps {
  initPalette: () => go.Palette;
  divClassName: string;
  style?: React.CSSProperties;
  nodeDataArray: Array<go.ObjectData>;
  linkDataArray?: Array<go.ObjectData>;
  modelData?: go.ObjectData;
}

/**
 * A Palette component to allow a GoJS palette to be used within a React app.
 *
 * Data arrays passed to this component will be deep cloned before usage in a GoJS model, preserving immutability.
 */
export class ReactPalette extends React.Component<PaletteProps, {}> {
  /** @internal */
  private divRef: React.RefObject<HTMLDivElement>;
  /** @internal */
  private wasCleared: boolean = false;

  /** @internal */
  constructor(props: PaletteProps) {
    super(props);
    this.divRef = React.createRef();
  }

  /**
   * Returns a reference to the GoJS palette instance for this component.
   */
  public getPalette(): go.Palette | null {
    if (this.divRef.current === null) return null;
    return go.Diagram.fromDiv(this.divRef.current) as go.Palette;
  }

  /**
   * Clears the palette and allows the next update to be treated as an initial load of the model.
   */
  public clear(): void {
    const palette = this.getPalette();
    if (palette !== null) {
      palette.clear();
      this.wasCleared = true;
    }
  }

  /**
   * @internal
   * Initialize the palette.
   */
  public componentDidMount() {
    if (this.divRef.current === null) return;
    const palette = this.props.initPalette();

    palette.div = this.divRef.current;
    palette.delayInitialization(() => {
      this.mergeData(palette, true);
    });
  }

  /**
   * @internal
   * Disassociate the palette from the div.
   */
  public componentWillUnmount() {
    const palette = this.getPalette();
    if (palette !== null) {
      palette.div = null;
    }
  }

  /**
   * @internal
   * Determines whether component needs to update by doing a shallow compare on props.
   * @param nextProps
   * @param nextState
   */
  public shouldComponentUpdate(nextProps: PaletteProps, nextState: any) {
    if (nextProps.divClassName !== this.props.divClassName || nextProps.style !== this.props.style) return true;
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
  public componentDidUpdate(prevProps: PaletteProps, prevState: any) {
    // quick shallow compare, maybe it was just a style update
    if (prevProps.nodeDataArray === this.props.nodeDataArray &&
        prevProps.linkDataArray === this.props.linkDataArray &&
        prevProps.modelData === this.props.modelData) return;
    const palette = this.getPalette();
    if (palette !== null) {
      // if clear was just called, treat this as initial
      if (this.wasCleared) {
        palette.delayInitialization(() => {
          this.mergeData(palette, true);
          this.wasCleared = false;
        });
      } else {
        this.mergeData(palette, false);
      }
    }
  }

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
