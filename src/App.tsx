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
    static: boolean
    attributes: string
}

interface DashboardTab {
    name: string
    columns: number
    widgets: DashboardWidget[]
}

interface DashboardSchema {
    tabs: DashboardTab[]
}

const App = () => {
    const [tabIndex, setTabIndex] = useState(0)
    const [schema, setSchema] = useState<DashboardSchema>({
        tabs: [],
    })

    useEffect(() => {
        // @ts-ignore
        window.setSchema = (schema: string) => setSchema(JSON.parse(schema))
        // @ts-ignore
        window.getSchema = () => JSON.stringify(schema, null, 4)
    })

    const setLayouts = (tabIndex: number, layouts: Layout[]) => {
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
                        widgets[index] = {
                            ...widgets[index],
                            ...layout,
                        }
                    }

                    return {
                        ...tab,
                        widgets: widgets,
                    }
                }),
            }
        })
    }

    const updateWidgetTitle = (
        tabName: string,
        widgetName: string,
        event: KeyboardEvent | FormEvent
    ) => {
        const name = (event.currentTarget as HTMLHeadingElement).textContent
        setSchema((schema) => {
            return {
                tabs: schema.tabs.map((tab) => {
                    if (tab.name !== tabName) {
                        return tab
                    }

                    return {
                        ...tab,
                        widgets: tab.widgets.map((widget) => {
                            if (widget.name !== widgetName) {
                                return widget
                            }

                            return {
                                ...widget,
                                name,
                            }
                        }),
                    }
                }),
            }
        })
    }

    return (
        <Tabs onSelect={(index) => setTabIndex(index)}>
            <TabList>
                {schema.tabs.map((tab) => (
                    <Tab key={tab.name}>{tab.name}</Tab>
                ))}
            </TabList>

            {schema.tabs.map((tab, index) => (
                <TabPanel key={tab.name}>
                    <GridLayout
                        cols={tab.columns}
                        rowHeight={116}
                        maxRows={6}
                        width={1600}
                        onLayoutChange={(layouts) => setLayouts(index, layouts)}
                        verticalCompact={false}
                        preventCollision={true}
                    >
                        {tab.widgets.map((widget) => {
                            return (
                                <div
                                    key={widget.name}
                                    data-grid={{
                                        i: widget.name,
                                        x: widget.x,
                                        y: widget.y,
                                        h: widget.h,
                                        w: widget.w,
                                        static: widget.static,
                                    }}
                                >
                                    <div
                                        style={{
                                            height: "calc(100% - 20px)",
                                            width: "calc(100% - 20px)",
                                            margin: 10,
                                            borderColor: "var(--widget-border)",
                                            borderWidth: 2,
                                            borderRadius: 10,
                                            borderStyle: "solid",
                                            display: "flex",
                                            flexDirection: "column",
                                        }}
                                    >
                                        <div className="widget-title">
                                            <h2
                                                contentEditable
                                                onKeyPress={(event) => {
                                                    if (event.key === "Enter") {
                                                        event.preventDefault()
                                                        updateWidgetTitle(
                                                            tab.name,
                                                            widget.name,
                                                            event
                                                        )
                                                    }
                                                }}
                                                onKeyDown={(event) => {
                                                    const name = (
                                                        event.target as HTMLHeadingElement
                                                    ).textContent
                                                    if (
                                                        event.key ===
                                                            "Backspace" &&
                                                        name.length === 1
                                                    ) {
                                                        event.preventDefault()
                                                    }
                                                }}
                                                style={{
                                                    textAlign: "center",
                                                    margin: 5,
                                                    outline: "none",
                                                }}
                                            >
                                                {widget.name}
                                            </h2>
                                        </div>
                                        <hr
                                            style={{
                                                width: "calc(100% - 2px)",
                                                borderColor:
                                                    "var(--widget-border)",
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
                                                    margin: "auto",
                                                    backgroundColor: "white",
                                                    color: "black",
                                                    borderBottomRightRadius: 5,
                                                    borderBottomLeftRadius: 5,
                                                    width: "100%",
                                                    height: "100%",
                                                }}
                                                dangerouslySetInnerHTML={{
                                                    __html: `<${widget.type} ${widget.attributes} style="width: calc(100% - 10px); height: calc(100% - 10px);"></${widget.type}>`,
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </GridLayout>
                </TabPanel>
            ))}
        </Tabs>
    )
}

ReactDOM.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
    document.getElementById("root")
)
