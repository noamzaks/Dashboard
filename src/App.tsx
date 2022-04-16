import React, { useState, useEffect } from "react"
import ReactDOM from "react-dom"
import GridLayout, { Layout } from "react-grid-layout"
import "react-grid-layout/css/styles.css"
import "./dark.css"
import Ripples from "react-ripples"
import Logo from "./Logo"
import { Tabs, Tab } from "baseui/tabs-motion"
import { Provider as StyletronProvider } from "styletron-react"
import { Client as Styletron } from "styletron-engine-atomic"
import { DarkTheme, BaseProvider } from "baseui"
import { Input } from "baseui/input"
import { Combobox } from "baseui/combobox"

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

const star = ["Zaks", "Imri", "Yair"][Math.floor(Math.random() * 3)]

const Widget: React.FC<{
    widget: DashboardWidget
    onClick?: () => void
    remove?: () => void
    lock: boolean
}> = ({ widget, onClick, remove, lock }) => {
    return (
        <div
            style={{
                height: "calc(100% - 10px)",
                width: "calc(100% - 10px)",
                margin: 5,
                borderColor: "var(--widget-border)",
                borderWidth: 1,
                borderRadius: 10,
                borderStyle: "solid",
                backgroundColor: "#222",
                display: "flex",
                flexDirection: "column",
                boxShadow: "0 0 5px",
            }}
        >
            <Ripples className="widget-title" during={800} onClick={onClick}>
                <h3
                    style={{
                        textAlign: "center",
                        userSelect: "none",
                        margin: 5,
                        outline: "none",
                        width: "100%",
                    }}
                >
                    {widget.name}
                </h3>
                {!lock && (
                    <button
                        style={{
                            backgroundColor: "inherit",
                            color: "inherit",
                            cursor: "pointer",
                            border: "none",
                            marginRight: "5px",
                        }}
                        onClick={remove}
                    >
                        X
                    </button>
                )}
            </Ripples>
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
                    onClick={onClick}
                    style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        textAlign: "center",
                        margin: "auto",
                        color: "white",
                        borderBottomRightRadius: 5,
                        borderBottomLeftRadius: 5,
                        width: "95%",
                        height: "95%",
                    }}
                    dangerouslySetInnerHTML={{
                        __html: `<${widget.type} ${widget.attributes} ${
                            widget.sourceKey && widget.sourceKey.length > 0
                                ? widget.sourceKey.startsWith("/")
                                    ? "source-key='" + widget.sourceKey + "'"
                                    : "source-key='/MisCar/" +
                                      widget.sourceKey +
                                      "'"
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
    const [connected, setConnected] = useState(false)
    const [rotation, setRotation] = useState(0)
    const [activeKey, setActiveKey] = React.useState("0")

    useEffect(() => {
        // @ts-ignore
        window.setSchema = (schema: string) => setSchema(JSON.parse(schema))
        // @ts-ignore
        window.getSchema = () => JSON.stringify(schema, null, 4)
        // @ts-ignore
        window.tabLock = () => setLock(true)
        // @ts-ignore
        window.tabUnlock = () => setLock(false)

        var ntLoaded = () => {
            // @ts-ignore
            window.NetworkTables.addRobotConnectionListener((connected) => {
                setConnected(connected)
            }, true)
        }
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
                        const index = parseInt(layout.i, 10)

                        if (index !== NaN) {
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
            {lock && (
                <div
                    style={{
                        width: 150,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        userSelect: "none",
                    }}
                >
                    <div
                        onClick={() => setRotation((rotation) => rotation + 72)}
                        style={{
                            paddingTop: 15,
                            transform: `rotate(${rotation}deg)`,
                            transition: "250ms ease-in-out",
                        }}
                    >
                        <Logo />
                    </div>
                    <h2 className="title">Dashboard</h2>
                    <div style={{ flexGrow: 1 }} />
                    <p>🌟 {star}</p>
                    <div style={{ flexGrow: 1 }} />
                    {connected ? (
                        <p style={{ color: "green" }}>Connected</p>
                    ) : (
                        <p style={{ color: "red" }}>Disconnected</p>
                    )}
                </div>
            )}

            {!lock && (
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        width: 130,
                        paddingRight: 10,
                        paddingLeft: 10,
                        textAlign: "center",
                    }}
                >
                    <h1>Editor</h1>
                    <div
                        className="droppable-element"
                        draggable={true}
                        unselectable="on"
                        style={{
                            color: "white",
                            width: 116,
                            height: 116,
                            marginRight: "auto",
                            marginLeft: "auto",
                        }}
                    >
                        <Widget
                            widget={{
                                name: "New",
                                type: "frc-label",
                                x: 0,
                                y: 0,
                                w: 1,
                                h: 1,
                                sourceKey: "",
                                attributes: "",
                            }}
                            lock={true}
                        />
                    </div>
                    {currentWidget && (
                        <>
                            <p>Title</p>
                            <Input
                                type="text"
                                size="compact"
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
                                        ].name = (
                                            e.target as HTMLInputElement
                                        ).value
                                        return { ...schema }
                                    })
                                }}
                            />
                            <p>Type</p>
                            <Combobox
                                value={
                                    schema.tabs[currentWidget.tabIndex].widgets[
                                        currentWidget.widgetIndex
                                    ].type
                                }
                                onChange={(value) => {
                                    setSchema((schema) => {
                                        schema.tabs[
                                            currentWidget.tabIndex
                                        ].widgets[
                                            currentWidget.widgetIndex
                                        ].type = value
                                        return { ...schema }
                                    })
                                }}
                                options={[
                                    "frc-gauge",
                                    "frc-boolean-box",
                                    "frc-label",
                                    "frc-combo-box",
                                    "frc-number-field",
                                    "frc-toggle-button",
                                    "frc-toggle-switch",
                                ]}
                                mapOptionToString={(option) => option}
                            />
                            <p>Source Key</p>
                            <Input
                                type="text"
                                size="compact"
                                value={
                                    schema.tabs[currentWidget.tabIndex].widgets[
                                        currentWidget.widgetIndex
                                    ].sourceKey
                                }
                                onChange={(e) => {
                                    setSchema((schema) => {
                                        schema.tabs[
                                            currentWidget.tabIndex
                                        ].widgets[
                                            currentWidget.widgetIndex
                                        ].sourceKey = (
                                            e.target as HTMLInputElement
                                        ).value
                                        return { ...schema }
                                    })
                                }}
                            />
                            <p>Attributes</p>
                            <Input
                                type="text"
                                size="compact"
                                value={
                                    schema.tabs[currentWidget.tabIndex].widgets[
                                        currentWidget.widgetIndex
                                    ].attributes
                                }
                                onChange={(e) => {
                                    setSchema((schema) => {
                                        schema.tabs[
                                            currentWidget.tabIndex
                                        ].widgets[
                                            currentWidget.widgetIndex
                                        ].attributes = (
                                            e.target as HTMLInputElement
                                        ).value
                                        return { ...schema }
                                    })
                                }}
                            />
                            <p>Inner HTML</p>
                            <Input
                                type="text"
                                value={
                                    schema.tabs[currentWidget.tabIndex].widgets[
                                        currentWidget.widgetIndex
                                    ].innerHTML
                                }
                                onChange={(e) => {
                                    setSchema((schema) => {
                                        schema.tabs[
                                            currentWidget.tabIndex
                                        ].widgets[
                                            currentWidget.widgetIndex
                                        ].innerHTML = (
                                            e.target as HTMLInputElement
                                        ).value
                                        return { ...schema }
                                    })
                                }}
                            />
                        </>
                    )}
                </div>
            )}

            <div style={{ flexGrow: 1 }}>
                <Tabs
                    onChange={({ activeKey }) => {
                        setActiveKey(activeKey as string)
                    }}
                    activeKey={activeKey}
                >
                    {schema.tabs.map((tab, tabIndex) => (
                        <Tab key={tab.name} title={tab.name}>
                            <GridLayout
                                cols={tab.columns}
                                rowHeight={109}
                                maxRows={6}
                                width={1560}
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
                                            type: "frc-label",
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
                                                <Widget
                                                    lock={lock}
                                                    widget={widget}
                                                    onClick={() =>
                                                        setCurrentWidget({
                                                            tabIndex,
                                                            widgetIndex,
                                                        })
                                                    }
                                                    remove={() => {
                                                        setSchema((schema) => {
                                                            return {
                                                                tabs: schema.tabs.map(
                                                                    (
                                                                        tab,
                                                                        index
                                                                    ) => {
                                                                        if (
                                                                            index !==
                                                                            tabIndex
                                                                        ) {
                                                                            return tab
                                                                        }

                                                                        return {
                                                                            ...tab,
                                                                            widgets:
                                                                                tab.widgets.filter(
                                                                                    (
                                                                                        __,
                                                                                        index
                                                                                    ) =>
                                                                                        index !==
                                                                                        widgetIndex
                                                                                ),
                                                                        }
                                                                    }
                                                                ),
                                                            }
                                                        })
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    )
                                })}
                            </GridLayout>
                        </Tab>
                    ))}
                </Tabs>
            </div>
        </div>
    )
}

const engine = new Styletron()

ReactDOM.render(
    <React.StrictMode>
        <StyletronProvider value={engine}>
            <BaseProvider theme={DarkTheme}>
                <App />
            </BaseProvider>
        </StyletronProvider>
    </React.StrictMode>,
    document.getElementById("root")
)
