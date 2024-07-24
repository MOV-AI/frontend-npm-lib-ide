import * as d3 from 'd3';
import { generatePathPoints } from "./generatePathPoints";
import BaseLink from './BaseLink';

// Mock the dependencies
jest.mock('d3', () => {
  const originalModule = jest.requireActual('d3');
  const lineMock = jest.fn(() => 'mockedPath');
  lineMock.curve = jest.fn().mockReturnThis();
  lineMock.x = jest.fn().mockReturnThis();
  lineMock.y = jest.fn().mockReturnThis();

  return {
    ...originalModule,
    line: jest.fn(() => lineMock),
    create: jest.fn().mockReturnValue({
      attr: jest.fn().mockReturnThis(),
      append: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      remove: jest.fn(),
      node: jest.fn(),
      on: jest.fn().mockReturnThis(),
    }),
    event: {
      preventDefault: jest.fn(),
      stopPropagation: jest.fn(),
    },
  };
});

jest.mock('../../../../../utils/Utils', () => ({
  defaultFunction: jest.fn(),
}));

jest.mock('../Nodes/BaseNode/PortValidator', () => ({
  isLinkeable: jest.fn().mockReturnValue(true),
}));

jest.mock('./generatePathPoints', () => ({
  generatePathPoints: jest.fn().mockReturnValue([]),
}));

describe('BaseLink', () => {
  let canvas, src, trg, data, baseLink;

  beforeEach(() => {
    canvas = {
      maxMovingPixels: 100,
      containerId: 'testCanvas',
      events: { next: jest.fn() },
      mode: { current: { id: '' }, linking: { activelyLinking: false } },
      selectedLink: null,
      readOnly: false,
      setMode: jest.fn(),
    };
    src = { x: 0, y: 0, nodeSize: { height: 10, width: 10 }, type: 'Out' };
    trg = { x: 10, y: 10, nodeSize: { height: 10, width: 10 }, type: 'In' };
    data = {
      id: 'link1',
      sourceNode: 'node1',
      sourcePort: 'port1',
      targetNode: 'node2',
      targetPort: 'port2',
      dependency: 'dependency1',
      error: null,
      sourceFullPath: 'node1/port1',
      targetFullPath: 'node2/port2',
    };
    baseLink = new BaseLink(canvas, src, trg, data);
  });

  it('should initialize correctly', () => {
    const expectedData = {
      id: 'link1',
      sourceNode: 'node1',
      sourcePort: 'port1',
      targetNode: 'node2',
      targetPort: 'port2',
      sourceFullPath: 'node1/port1',
      targetFullPath: 'node2/port2',
      Dependency: 'dependency1',
    };
    expect(baseLink.data).toEqual(expectedData);
    expect(baseLink.src).toEqual(src);
    expect(baseLink.trg).toEqual(trg);
    expect(baseLink.error).toBeNull();
  });

  it('should set and get visibility correctly', () => {
    baseLink.visibility = true;
    expect(baseLink.visible).toBe(true);
    baseLink.visibility = false;
    expect(baseLink.visible).toBe(false);
  });

  it('should render path correctly', () => {
    baseLink.renderPath();
    expect(d3.create).toHaveBeenCalledWith('svg');
    expect(baseLink.object.attr).toHaveBeenCalledWith('id', 'path-testCanvas-link1');
  });

  it('should set data-testid correctly', () => {
    baseLink.renderPath();
    const expectedTestId = 'link-from-node1-port-port1-to-node2-port-port2';
    expect(baseLink.object.attr).toHaveBeenCalledWith('data-testid', expectedTestId);
  });

  it('should calculate path and line correctly', () => {
    const pathPoints = [{ x: 0, y: 0 }, { x: 10, y: 10 }];
    generatePathPoints.mockReturnValueOnce(pathPoints);
    baseLink.calculatePath();
    expect(baseLink.pathPoints).toEqual(pathPoints);
    const line = baseLink.calculateLine(pathPoints);
    expect(line).toEqual('mockedPath');
  });

  it('should handle events correctly', () => {
    baseLink.renderPath();
    baseLink.addEvents();
    expect(baseLink.path.on).toHaveBeenCalledWith('mouseover', expect.any(Function));
    expect(baseLink.path.on).toHaveBeenCalledWith('mouseout', expect.any(Function));
    expect(baseLink.path.on).toHaveBeenCalledWith('click', expect.any(Function));
    expect(baseLink.path.on).toHaveBeenCalledWith('contextmenu', expect.any(Function));
  });

  it('should update link data correctly', () => {
    const newData = { id: 'link2', sourceNode: 'node3' };
    baseLink.updateData(newData);
    expect(baseLink.data).toMatchObject(newData);
  });

  it('should update error correctly', () => {
    const error = { message: 'error' };
    baseLink.updateError(error);
    expect(baseLink.error).toEqual(error);
  });

  it('should fade other links and remove fade correctly', () => {
    baseLink.fadeOtherLinks();
    expect(canvas.events.next).toHaveBeenCalledWith({ name: 'onMouseOver', type: 'Link', data: baseLink });
    baseLink.removeLinksFade();
    expect(canvas.events.next).toHaveBeenCalledWith({ name: 'onMouseOut', type: 'Link', data: baseLink });
  });
});
