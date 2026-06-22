/** TableHelper，使用TableCore */
;(function () {
    function flexRender(comp, props) {
        if (typeof comp === 'function') {
            return comp(props)
        }
        return comp
    }

    function useTable(options) {
        const { createTable, functionalUpdate, getCoreRowModel, getPaginationRowModel, getSortedRowModel, getFilteredRowModel } = TableCore
        const resolveOptions = {
            state: {},
            ...options,
            getCoreRowModel: getCoreRowModel(),
            getPaginationRowModel: getPaginationRowModel(),
            getSortedRowModel: getSortedRowModel(),
            getFilteredRowModel: getFilteredRowModel()
        }

        const table = createTable(resolveOptions)
        const state = table.initialState

        table.setOptions((prev) => {
            return {
                ...prev,
                ...options,
                state: {
                    ...state,
                    ...options.state
                },
                onStateChange: updater => {
                    const newState = functionalUpdate(updater, table.getState())
                    const currentState = table.getState()
                    // 只有在狀態改變時才更新
                    if (JSON.stringify(newState) !== JSON.stringify(currentState)) {

                        table.setOptions((p) => {
                            return {
                                ...p,
                                state: { ...p.state, ...newState }
                            }
                        })

                        if (options.onStateChange) {
                            options.onStateChange(newState)
                        }
                    }
                }
            }
        })

        return table
    }
    function generatePageNums(currentPage, pageCount, maxVisible = 5) {
        const buttons = [];
        const delta = Math.floor((maxVisible - 3) / 2);  // 附近頁數（扣除邊界和最後）

        // 如果總頁少於 maxVisible，直接全顯示
        if (pageCount <= maxVisible) {
            for (let i = 0; i < pageCount; i++) buttons.push(i);
            return buttons;
        }

        // 總是顯示第一頁
        buttons.push(0);

        // 顯示當前頁附近（避免重複）
        const start = Math.max(1, currentPage - delta);
        const end = Math.min(pageCount - 2, currentPage + delta);
        for (let i = start; i <= end; i++) {
            if (!buttons.includes(i)) buttons.push(i);
        }

        // 檢查第一頁後是否有間隙 → 插入 ...
        if (buttons[1] > 1) {
            buttons.splice(1, 0, '...');
        }

        // 檢查當前附近後是否有間隙 → 插入 ...
        const lastNearby = end;
        if (lastNearby < pageCount - 2) {
            buttons.push('...');
        }

        // 總是顯示最後一頁
        if (!buttons.includes(pageCount - 1)) {
            buttons.push(pageCount - 1);
        }

        return buttons;
    }

    function q(el) {
        return el instanceof HTMLElement ? el : document.querySelector(el)
    }

    /**
     * @typedef TableOptions
     * @prop {Array<unknown>} data - 表格資料陣列
     * @prop {Array<import('@tanstack/table-core').ColumnDef<unknown, any>>} columns - 表格欄位定義
     * @prop {import('@tanstack/table-core').TableState} [state] - 初始表格狀態
     * @prop {(element: HTMLElement, table: import('@tanstack/table-core').Table<unknown>)} [beforeMounted] - 元素掛載前的hook
     */

    /**
     * support tanstack table core and Bootstrap style
     */
    class Table {
        /**
         * 
         * @param {string | HTMLElement} el
         * @param {TableOptions} options
         */
        constructor(el, options) {
            this.element = q(el)
            this.table = useTable({
                data: options.data,
                columns: options.columns,
                state: options.state,
                onStateChange: (newState) => {
                    this.render()
                    if (options?.state?.onStateChange) {
                        options.state.onStateChange(newState)
                    }
                }
            })

            this.thead = this.element.querySelector('thead')
            this.tbody = this.element.querySelector('tbody')
            this.pagination = null

            if (this.table.getState()?.pagination) {
                this.pagination = this.element.querySelector('.pagination')
            }

            // 初始化hooks
            options?.beforeMounted && options?.beforeMounted(this.element, this.table)
        }

        /**
         * @typedef BindOptions
         * @prop {Array<unknown>} data - 表格資料陣列
         * @prop {Array<import('@tanstack/table-core').ColumnDef<unknown, any>>} columns - 表格欄位定義
         */

        /**
         * 更新表格資料和欄位定義
         * @param {BindOptions} options 
         */
        update(options) {
            this.table.setOptions((prev) => {
                return {
                    ...prev,
                    data: options.data,
                    columns: options.columns,
                }
            })
        }

        columnFilter(id, val) {
            this.table.getColumn(id).setFilterValue(val)
        }

        render() {
            this.table.getHeaderGroups().forEach(headerGroup => {

                const thFragment = document.createDocumentFragment()
                const tr = document.createElement('tr')

                headerGroup.headers.forEach(header => {
                    const canSort = header.column.getCanSort()
                    const th = document.createElement('th')
                    const meta = header.column.columnDef?.meta
                    const sortDir = header.column.getIsSorted()
                    if (sortDir) {
                        th.classList.add(sortDir)
                    }
                    th.textContent = tableHelper.flexRender(header.column.columnDef.header, header.getContext())
                    if (canSort) {
                        // th.classList.add('table-sort')
                        th.onclick = (e) => header.column.getToggleSortingHandler()(e)
                    }

                    if (meta?.className) {
                        th.classList.add(meta.className)
                    }
                    thFragment.appendChild(th)
                })

                tr.appendChild(thFragment)
                this.thead.replaceChildren()
                this.thead.appendChild(tr)
            })

            const trFragment = document.createDocumentFragment()
            this.table.getRowModel().rows.forEach(row => {
                const tdFragment = document.createDocumentFragment()
                const tr = document.createElement('tr')
                row.getVisibleCells().forEach(cell => {
                    const td = document.createElement('td')
                    const content = flexRender(cell.column.columnDef.cell, cell.getContext())
                    const meta = cell.column.columnDef?.meta
                    if (meta?.className) {
                        td.classList.add(meta.className)
                    }
                    td.append(content)
                    tdFragment.appendChild(td)
                })

                tr.appendChild(tdFragment)
                trFragment.appendChild(tr)
            })
            this.tbody.replaceChildren()
            this.tbody.appendChild(trFragment)

            // 如果有設定 pagination state 處理 page 渲染
            if (this.pagination) {
                const state = this.table.getState()
                const count = this.table.getPageCount()
                const current = state.pagination.pageIndex
                const buttons = tableHelper.generatePageNums(current, count, state.pagination.pageSize)
                const liFragment = document.createDocumentFragment()
                buttons.forEach(n => {
                    const li = document.createElement('li')
                    const btn = document.createElement('button')
                    li.classList.add('page-item')
                    btn.classList.add('page-link')
                    btn.setAttribute('type', 'button')

                    if (n === '...') {
                        li.classList.add('disabled')
                        btn.textContent = '…'
                    } else {
                        btn.onclick = () => this.table.setPageIndex(n)
                        if (current === n) {
                            li.classList.add('active')
                        }
                        btn.textContent = n + 1
                    }

                    li.appendChild(btn)
                    liFragment.appendChild(li)
                })
                this.pagination.replaceChildren()
                this.pagination.appendChild(liFragment)
            }
        }
    }

    window.tableHelper = { useTable, flexRender, generatePageNums, Table }
})()