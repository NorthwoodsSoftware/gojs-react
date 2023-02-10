/*
*  Copyright (C) 1998-2023 by Northwoods Software Corporation. All Rights Reserved.
*/

import * as go from 'gojs';
import * as React from 'react';

/**
 * Properties passed to the Overview component.
 */
export interface OverviewProps {
  initOverview?: () => go.Overview;
  divClassName: string;
  style?: React.CSSProperties;
  observedDiagram: go.Diagram | null;
}

/**
 * An Overview component to allow a GoJS overview to be used within a React app.
 */
export class ReactOverview extends React.Component<OverviewProps, {}> {
  /** @internal */
  private divRef: React.RefObject<HTMLDivElement>;

  /** @internal */
  constructor(props: OverviewProps) {
    super(props);
    this.divRef = React.createRef();
  }

  /**
   * Returns a reference to the GoJS overview instance for this component.
   */
  public getOverview(): go.Overview | null {
    if (this.divRef.current === null) return null;
    return go.Diagram.fromDiv(this.divRef.current) as go.Overview;
  }

  /**
   * @internal
   * Initialize the overview.
   */
  public componentDidMount() {
    if (this.divRef.current === null) return;

    let overview: go.Overview;
    if (this.props.initOverview !== undefined) {
      overview = this.props.initOverview();
    } else {
      overview = new go.Overview();
      overview.contentAlignment = go.Spot.Center;
    }
    overview.div = this.divRef.current;
    overview.observed = this.props.observedDiagram;
  }

  /**
   * @internal
   * Disassociate the overview from the div.
   */
  public componentWillUnmount() {
    const overview = this.getOverview();
    if (overview !== null) {
      overview.div = null;
      overview.observed = null;
    }
  }

  /**
   * @internal
   * Determines whether component needs to update by checking the new props.
   * @param nextProps
   * @param nextState
   */
  public shouldComponentUpdate(nextProps: OverviewProps, nextState: any) {
    if (nextProps.divClassName !== this.props.divClassName || nextProps.style !== this.props.style) return true;
    if (nextProps.observedDiagram === this.props.observedDiagram) return false;
    return true;
  }

  /**
   * @internal
   * When the component updates, merge all data changes into the GoJS model to ensure everything stays in sync.
   * @param prevProps
   * @param prevState
   */
  public componentDidUpdate(prevProps: OverviewProps, prevState: any) {
    // quick shallow compare, maybe it was just a style update
    if (prevProps.observedDiagram === this.props.observedDiagram) return;
    const overview = this.getOverview();
    if (overview !== null) {
      overview.observed = this.props.observedDiagram;
    }
  }

  /** @internal */
  public render() {
    return (<div ref={this.divRef} className={this.props.divClassName} style={this.props.style}></div>);
  }
}
