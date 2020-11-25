/*
*  Copyright (C) 1998-2020 by Northwoods Software Corporation. All Rights Reserved.
*/

import * as go from 'gojs';
import * as React from 'react';

/**
 * Properties passed to the Palette component.
 */
export interface PaletteProps {
  initPalette: () => go.Palette;
  divClassName: string;
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
  constructor(props: PaletteProps) {
    super(props);
    this.divRef = React.createRef();
  }

  /**
   * Returns a reference to the GoJS palette instance for this component.
   */
  public getPalette(): go.Palette | null {
    if (this.divRef.current === null) return null;
    return go.Diagram.fromDiv(this.divRef.current);
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
      const model = palette.model;
      model.commit((m: go.Model) => {
        if (this.props.modelData !== undefined) {
          m.assignAllDataProperties(m.modelData, this.props.modelData);
        }
        m.mergeNodeDataArray(this.props.nodeDataArray);
        if (this.props.linkDataArray !== undefined && m instanceof go.GraphLinksModel) {
          m.mergeLinkDataArray(this.props.linkDataArray);
        }
      }, null);
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
   * Determines whether component needs to update by checking the skips flag and doing a shallow compare on props.
   * @param nextProps
   * @param nextState
   */
  public shouldComponentUpdate(nextProps: PaletteProps, nextState: any) {
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
    const palette = this.getPalette();
    if (palette !== null) {
      const model = palette.model;
      model.startTransaction('update data');
      if (this.props.modelData !== undefined) {
        model.assignAllDataProperties(model.modelData, this.props.modelData);
      }
      model.mergeNodeDataArray(this.props.nodeDataArray);
      if (this.props.linkDataArray !== undefined && model instanceof go.GraphLinksModel) {
        model.mergeLinkDataArray(this.props.linkDataArray);
      }
      model.commitTransaction('update data');
    }
  }

  /** @internal */
  public render() {
    return (<div ref={this.divRef} className={this.props.divClassName}></div>);
  }
}
