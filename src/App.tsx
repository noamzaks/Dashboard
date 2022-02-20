import React, { useState, useEffect, FormEvent } from "react"
import ReactDOM from "react-dom"
import GridLayout, { Layout } from "react-grid-layout"
import { Tab, Tabs, TabList, TabPanel } from "react-tabs"
import "react-tabs/style/react-tabs.css"
import "react-grid-layout/css/styles.css"
import "react-resizable/css/styles.css"
import "./dark.css"

interface DashboardWidget {
    name: string
    type: string
    x: number
    y: number
    w: number
    h: number
    sourceKey: string
    attributes: string
    innerHTML?: string
    [element: string]: any
}

interface DashboardTab {
    name: string
    columns: number
    widgets: DashboardWidget[]
}

interface DashboardSchema {
    tabs: DashboardTab[]
}

interface WidgetSelector {
    tabIndex: number
    widgetIndex: number
}

const Widget: React.FC<{ widget: DashboardWidget }> = ({ widget }) => {
    return (
        <div
            style={{
                height: "calc(100% - 20px)",
                width: "calc(100% - 20px)",
                margin: 5,
                borderColor: "var(--widget-border)",
                borderWidth: 2,
                borderRadius: 10,
                borderStyle: "solid",
                display: "flex",
                flexDirection: "column",
            }}
        >
            <div className="widget-title">
                <h3
                    style={{
                        textAlign: "center",
                        userSelect: "none",
                        margin: 5,
                        outline: "none",
                    }}
                >
                    {widget.name}
                </h3>
            </div>
            <hr
                style={{
                    width: "calc(100% - 2px)",
                    borderColor: "var(--widget-border)",
                    margin: 0,
                }}
            />
            <div
                style={{
                    display: "flex",
                    overflow: "hidden",
                    flexGrow: 1,
                }}
            >
                <div
                    style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        textAlign: "center",
                        margin: "auto",
                        backgroundColor: "white",
                        color: "black",
                        borderBottomRightRadius: 5,
                        borderBottomLeftRadius: 5,
                        width: "100%",
                        height: "100%",
                    }}
                    dangerouslySetInnerHTML={{
                        __html: `<${widget.type} ${widget.attributes} ${
                            widget.sourceKey && widget.sourceKey.length > 0
                                ? "source-key='" + widget.sourceKey + "'"
                                : ""
                        } style="width: calc(100% - 10px); height: calc(100% - 10px);">${
                            widget.innerHTML ?? ""
                        }</${widget.type}>`,
                    }}
                />
            </div>
        </div>
    )
}

const App = () => {
    const [schema, setSchema] = useState<DashboardSchema>({
        tabs: [],
    })
    const [lock, setLock] = useState(true)
    const [currentWidget, setCurrentWidget] = useState<WidgetSelector>()

    useEffect(() => {
        // @ts-ignore
        window.setSchema = (schema: string) => setSchema(JSON.parse(schema))
        // @ts-ignore
        window.getSchema = () => JSON.stringify(schema, null, 4)
        // @ts-ignore
        window.tabLock = () => setLock(true)
        // @ts-ignore
        window.tabUnlock = () => setLock(false)
    })

    const setLayouts = (
        tabIndex: number,
        layouts: Layout[],
        toAdd: DashboardWidget[] = []
    ) => {
        setSchema((schema) => {
            return {
                tabs: schema.tabs.map((tab, index) => {
                    if (index !== tabIndex) {
                        return tab
                    }

                    const widgets = tab.widgets

                    for (const layout of layouts) {
                        const index = widgets.findIndex(
                            (widget) => widget.name === layout.i
                        )

                        if (index !== -1) {
                            widgets[index] = {
                                ...widgets[index],
                                ...layout,
                            }
                        }
                    }

                    return {
                        ...tab,
                        widgets: widgets.concat(toAdd),
                    }
                }),
            }
        })
    }

    return (
        <div
            style={{
                display: "flex",
                flexDirection: "row",
                height: "100vh",
            }}
        >
            {!lock && (
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        width: 240,
                        paddingRight: 5,
                        paddingLeft: 5,
                        marginRight: 10,
                        backgroundColor: "lightgrey",
                        color: "black",
                        textAlign: "center",
                    }}
                >
                    <h1>Editor</h1>
                    <div
                        className="droppable-element"
                        draggable={true}
                        unselectable="on"
                        // this is a hack for firefox
                        // Firefox requires some kind of initialization
                        // which we can do by adding this attribute
                        // @see https://bugzilla.mozilla.org/show_bug.cgi?id=568313
                        onDragStart={(e) =>
                            e.dataTransfer.setData("text/plain", "")
                        }
                        style={{
                            color: "white",
                            width: 116,
                            marginRight: "auto",
                            marginLeft: "auto",
                        }}
                    >
                        <Widget
                            widget={{
                                name: "New",
                                type: "frc-text-field",
                                x: 0,
                                y: 0,
                                w: 1,
                                h: 1,
                                sourceKey: "",
                                attributes: "",
                            }}
                        />
                    </div>
                    {currentWidget && (
                        <>
                            <p>Title</p>
                            <input
                                type="text"
                                value={
                                    schema.tabs[currentWidget.tabIndex].widgets[
                                        currentWidget.widgetIndex
                                    ].name
                                }
                                onChange={(e) => {
                                    setSchema((schema) => {
                                        schema.tabs[
                                            currentWidget.tabIndex
                                        ].widgets[
                                            currentWidget.widgetIndex
                                        ].name = e.target.value
                                        return { ...schema }
                                    })
                                }}
                            />
                            <p>Type</p>
                            <select
                                value={
                                    schema.tabs[currentWidget.tabIndex].widgets[
                                        currentWidget.widgetIndex
                                    ].type
                                }
                                onChange={(e) => {
                                    setSchema((schema) => {
                                        schema.tabs[
                                            currentWidget.tabIndex
                                        ].widgets[
                                            currentWidget.widgetIndex
                                        ].type = e.target.value
                                        return { ...schema }
                                    })
                                }}
                            >
                                <option value="frc-gauge">Gauge</option>
                                <option value="frc-line-chart">
                                    Line Chart
                                </option>
                                <option value="frc-3-axis-accelerometer">
                                    3-Axis Accelerometer
                                </option>
                                <option value="frc-accelerometer">
                                    Accelerometer
                                </option>
                                <option value="frc-basic-fms-info">
                                    Basic FMS Info
                                </option>
                                <option value="frc-basic-subsystem">
                                    Basic Subsystem
                                </option>
                                <option value="frc-differential-drivebase">
                                    Differential Drivebase
                                </option>
                                <option value="frc-encoder">Encoder</option>
                                <option value="frc-gyro">Gyro</option>
                                <option value="frc-mecanum-drivebase">
                                    Mecanum Drivebase
                                </option>
                                <option value="frc-model-viewer">
                                    Model Viewer
                                </option>
                                <option value="frc-networktable-tree">
                                    NetworkTable Tree
                                </option>
                                <option value="frc-power-distribution-panel">
                                    Power Distribution Panel
                                </option>
                                <option value="frc-relay">Relay</option>
                                <option value="frc-voltage-view">
                                    Voltage View
                                </option>
                                <option value="frc-boolean-box">
                                    Boolean Box
                                </option>
                                <option value="frc-label">Label</option>
                                <option value="frc-number-bar">
                                    Number Bar
                                </option>
                                <option value="frc-checkbox">Checkbox</option>
                                <option value="frc-checkbox-group">
                                    Checkbox Group
                                </option>
                                <option value="frc-combo-box">Combo Box</option>
                                <option value="frc-number-field">
                                    Number Field
                                </option>
                                <option value="frc-number-slider">
                                    Number Slider
                                </option>
                                <option value="frc-radio-button">
                                    Radio Button
                                </option>
                                <option value="frc-radio-group">
                                    Radio Group
                                </option>
                                <option value="frc-text-field">
                                    Text Field
                                </option>
                                <option value="frc-text-area">Text Area</option>
                                <option value="frc-text-view">Text View</option>
                                <option value="frc-toggle-button">
                                    Toggle Button
                                </option>
                                <option value="frc-toggle-switch">
                                    Toggle Switch
                                </option>
                                <option value="frc-camera">Camera</option>
                                <option value="frc-field">Field</option>
                                <option value="frc-networktables-connection">
                                    NetworkTables Connection
                                </option>
                                <option value="frc-code-editor">
                                    Code Editor
                                </option>
                            </select>
                            <p>Source Key</p>
                            <input
                                type="text"
                                value={
                                    schema.tabs[currentWidget.tabIndex].widgets[
                                        currentWidget.widgetIndex
                                    ].sourceKey
                                }
                                style={{ width: "calc(100% - 15px)" }}
                                onChange={(e) => {
                                    setSchema((schema) => {
                                        schema.tabs[
                                            currentWidget.tabIndex
                                        ].widgets[
                                            currentWidget.widgetIndex
                                        ].sourceKey = e.target.value
                                        return { ...schema }
                                    })
                                }}
                            />
                            <p>Attributes</p>
                            <input
                                type="text"
                                value={
                                    schema.tabs[currentWidget.tabIndex].widgets[
                                        currentWidget.widgetIndex
                                    ].attributes
                                }
                                style={{ width: "calc(100% - 15px)" }}
                                onChange={(e) => {
                                    setSchema((schema) => {
                                        schema.tabs[
                                            currentWidget.tabIndex
                                        ].widgets[
                                            currentWidget.widgetIndex
                                        ].attributes = e.target.value
                                        return { ...schema }
                                    })
                                }}
                            />
                        </>
                    )}
                </div>
            )}
            <div style={{ flexGrow: 1 }}>
                <Tabs>
                    <TabList>
                        {schema.tabs.map((tab) => (
                            <Tab key={tab.name}>{tab.name}</Tab>
                        ))}
                    </TabList>

                    {schema.tabs.map((tab, tabIndex) => (
                        <TabPanel key={tab.name}>
                            <GridLayout
                                cols={tab.columns}
                                rowHeight={123}
                                maxRows={6}
                                width={1735}
                                layout={schema.tabs[tabIndex].widgets.map(
                                    (widget, widgetIndex) => ({
                                        i: widgetIndex.toString(),
                                        x: widget.x,
                                        y: widget.y,
                                        h: widget.h,
                                        w: widget.w,
                                    })
                                )}
                                onLayoutChange={(layouts) =>
                                    setLayouts(tabIndex, layouts)
                                }
                                onDrop={(layouts, item, e) => {
                                    setLayouts(tabIndex, layouts, [
                                        {
                                            ...item,
                                            i: schema.tabs[tabIndex].widgets
                                                .length,
                                            name: "New",
                                            type: "frc-text-field",
                                            sourceKey: "",
                                            attributes: "",
                                        },
                                    ])
                                }}
                                compactType={null}
                                preventCollision={true}
                                isResizable={!lock}
                                isDraggable={!lock}
                                isDroppable={true}
                            >
                                {tab.widgets.map((widget, widgetIndex) => {
                                    return (
                                        <div
                                            key={widgetIndex.toString()}
                                            style={{
                                                width: "100%",
                                                height: "100%",
                                            }}
                                            onClick={() =>
                                                setCurrentWidget({
                                                    tabIndex,
                                                    widgetIndex,
                                                })
                                            }
                                        >
                                            <div
                                                style={{
                                                    width: "100%",
                                                    height: "100%",
                                                }}
                                            >
                                                <Widget widget={widget} />
                                            </div>
                                        </div>
                                    )
                                })}
                            </GridLayout>
                        </TabPanel>
                    ))}
                </Tabs>
            </div>
        </div>
    )
}

ReactDOM.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
    document.getElementById("root")
)
