<template>
    <div class="">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 items-center mb-4">
            <div>
                <h1 class="text-2xl font-bold mb-4">Expense Dashboard</h1>

                <button
                    @click="logout"
                    class="bg-red-500 text-white px-4 py-2 rounded mb-4"
                >
                    Logout
                </button>

                <div class="grid grid-cols-1 gap-2 my-4">
                    <div class="flex gap-4 mb-2">
                        <div>
                            <label class="font-bold mr-2">Start Date:</label>
                            <input
                                type="date"
                                v-model="filterStartDate"
                                class="border p-2 rounded"
                            />
                        </div>
                        <div>
                            <label class="font-bold mr-2">End Date:</label>
                            <input
                                type="date"
                                v-model="filterEndDate"
                                class="border p-2 rounded"
                            />
                        </div>
                        <div>
                            <label class="font-bold mr-2">Month:</label>
                            <input
                                type="month"
                                v-model="filterMonth"
                                class="border p-2 rounded"
                                placeholder="Select Month"
                            />
                        </div>
                    </div>
                    <div>
                        <button
                            @click="filterExpenses"
                            class="bg-green-400 text-white px-4 py-2 rounded hover:bg-green-600 m-2"
                        >
                            กรองข้อมูล
                        </button>
                        <button
                            @click="resetTable"
                            class="bg-red-500 text-white px-4 py-2 rounded hover:bg-green-600"
                        >
                            ล้างข้อมูล
                        </button>
                    </div>
                </div>

                <div class="mb-6">
                    <ul v-if="!noDataFound || !filterNotFound">
                        <li
                            v-if="filteredExpenses.length != 0"
                            class="font-bold text-xl text-left mb-2"
                        >
                            ยอดรวม: {{ totalFiltered }} บาท
                        </li>
                        <li
                            v-for="e in filteredExpenses"
                            :key="e.id"
                            class="text-left"
                            :style="getTypeStyle(e.type)"
                        >
                            {{ e.type }} - {{ e.amount }}บาท -
                            {{
                                (e.createdAt instanceof Timestamp
                                    ? e.createdAt.toDate()
                                    : new Date(e.createdAt)
                                ).toDateString()
                            }}
                        </li>
                    </ul>
                    <div
                        v-if="filterNotFound"
                        class="text-red-500 font-bold text-xl"
                    >
                        Choose Filter Ghon Noh.
                    </div>
                    <div
                        v-if="noDataFound"
                        class="text-red-500 font-bold text-xl"
                    >
                        No Data Found Jaa, Ha Mai Noh.
                    </div>
                </div>

                <!-- ✅ Summary -->
                <div class="bg-gray-500 p-4 rounded shadow">
                    <h2 class="text-xl font-semibold">
                        รวมทั้งหมด: {{ total }} บาท
                    </h2>
                </div>

                <form
                    @submit.prevent="addExpense"
                    class="flex gap-2 my-4 items-center justify-between"
                >
                    <div class="flex items-center justify-between gap-2 flex-1">
                        <div>
                            <p>ชื่อรายการใช้จ่าย:</p>
                            <input
                                v-model="title"
                                type="text"
                                placeholder="Title"
                                class="border p-2 rounded flex-1"
                            />
                        </div>
                        <div>
                            <p>จำนวนเงิน:</p>
                            <input
                                v-model.number="amount"
                                type="number"
                                placeholder="Amount"
                                class="border p-2 rounded w-32"
                            />
                        </div>
                        <div>
                            <p class="mb-1">ประเภท:</p>
                            <select
                                v-model="type"
                                class="border p-2 rounded mb-2"
                            >
                                <option>อาหารและน้ำดื่ม</option>
                                <option>ค่าเดินทาง</option>
                                <option>ค่าบริการรายเดือน</option>
                                <option>อื่นๆ</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <button
                            class="bg-green-500 text-white px-4 rounded mt-4"
                        >
                            Add
                        </button>
                    </div>
                </form>

                <table class="w-full border">
                    <thead>
                        <tr class="bg-white text-black">
                            <th class="border p-2">Title</th>
                            <th class="border p-2">Amount</th>
                            <th class="border p-2">Type</th>
                            <th class="border p-2">Created At</th>
                        </tr>
                    </thead>
                    <!-- <pre>{{ expenses }}</pre> -->
                    <tbody>
                        <tr
                            v-if="totalRows"
                            v-for="expense in pagedItems"
                            :key="expense.id"
                            :style="getTypeStyle(expense.type)"
                        >
                            <td class="border p-2">{{ expense.title }}</td>
                            <td class="border p-2">{{ expense.amount }}</td>
                            <td class="border p-2">
                                {{ expense.type }}
                            </td>
                            <td class="border p-2">
                                {{
                                    expense.createdAt?.toDate().toLocaleString()
                                }}
                            </td>
                        </tr>
                        <tr v-if="!totalRows">
                            <td
                                colspan="4"
                                class="px-3 py-6 text-center text-neutral-500"
                            >
                                ยังไม่มีรายการ
                            </td>
                        </tr>
                    </tbody>
                </table>
                <!-- Pagination controls -->
                <div
                    class="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
                >
                    <div class="text-sm text-neutral-600">
                        แสดง {{ fromRow }}–{{ toRow }} จาก
                        {{ totalRows }} รายการ
                    </div>

                    <div class="flex items-center gap-3">
                        <label class="text-sm text-neutral-600">แถว/หน้า</label>
                        <select
                            v-model.number="pageSize"
                            class="rounded-lg border border-neutral-300 bg-white px-2.5 py-1.5 text-sm focus:outline-none"
                        >
                            <option :value="5">5</option>
                            <option :value="10">10</option>
                            <option :value="20">20</option>
                            <option :value="50">50</option>
                        </select>

                        <div class="flex items-center gap-2">
                            <button
                                @click="prevPage"
                                class="inline-flex items-center rounded-lg border px-3 py-1.5 text-sm disabled:opacity-50"
                                :disabled="page <= 1"
                            >
                                ‹ ก่อนหน้า
                            </button>
                            <span class="text-sm text-neutral-700"
                                >หน้า {{ page }} / {{ totalPages }}</span
                            >
                            <button
                                @click="nextPage"
                                class="inline-flex items-center rounded-lg border px-3 py-1.5 text-sm disabled:opacity-50"
                                :disabled="page >= totalPages"
                            >
                                ถัดไป ›
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <div class="my-8">
                <div class="rounded-xl border border-neutral-200 bg-white p-4">
                    <h2 class="text-xl font-bold mb-4">Expense Chart</h2>
                    <canvas id="expenseChart" width="400" height="200"></canvas>
                </div>
            </div>
            <!-- <div class="lg:w-[380px] lg:flex-none">
                <div class="rounded-xl border border-neutral-200 bg-white p-4">
                    <div class="text-sm font-medium text-neutral-600 mb-2">
                        สัดส่วนตามประเภท
                    </div>
                    <canvas id="expenseChart" height="280"></canvas>
                </div>
            </div> -->
        </div>
    </div>
</template>

<script setup>
import {
    ref,
    computed,
    watch,
    watchEffect,
    onMounted,
    onBeforeUnmount,
} from 'vue'
import { auth, db } from '../firebase/config'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import {
    doc,
    setDoc,
    getDocs,
    collection,
    query,
    where,
    orderBy,
    onSnapshot,
    addDoc,
    serverTimestamp,
    Timestamp,
} from 'firebase/firestore'

import { Chart, registerables } from 'chart.js'

Chart.register(...registerables)

let chartInstance = null

// state
const expenses = ref([]) // ข้อมูลที่แสดงบนตาราง
const allExpenses = ref([]) // เก็บข้อมูลจริงทั้งหมดจาก Firestore
const title = ref('')
const amount = ref(0)
const total = ref(0) // total ของข้อมูลที่กรองแล้ว
const type = ref('ค่าอาหารและน้ำดื่ม')

let unsubscribeSnapshot = null
const currentUid = ref(null)

const filteredExpenses = ref([]) // ข้อมูลหลัง filter
const totalFiltered = ref(0)
const filterStartDate = ref(null)
const filterEndDate = ref(null)
const filterMonth = ref(null) // 'YYYY-MM'
const totalAmount = ref(0)
const filterNotFound = ref(false)
const noDataFound = ref(false)

const page = ref(1)
const pageSize = ref(20) // ปรับค่าเริ่มต้นได้: 5/10/20

// รองรับทั้งกรณี items เป็น array ตรง ๆ หรือเป็น ref(array)
const allItems = computed(() =>
    Array.isArray(expenses.value) ? expenses.value : expenses?.value || []
)

const totalRows = computed(() => allItems.value.length)
const totalPages = computed(() =>
    Math.max(1, Math.ceil(totalRows.value / pageSize.value))
)

// เปลี่ยนชุดข้อมูล/ขนาดหน้า → รีเซ็ตไปหน้า 1
watch([allItems, pageSize], () => {
    page.value = 1
})

// กันหน้าเกินเมื่อข้อมูลหด
watchEffect(() => {
    if (page.value > totalPages.value) page.value = totalPages.value
})

const pagedItems = computed(() => {
    const start = (page.value - 1) * pageSize.value
    return allItems.value.slice(start, start + pageSize.value)
})

const fromRow = computed(() =>
    totalRows.value ? (page.value - 1) * pageSize.value + 1 : 0
)
const toRow = computed(() =>
    Math.min(totalRows.value, page.value * pageSize.value)
)

function prevPage() {
    if (page.value > 1) page.value--
}
function nextPage() {
    if (page.value < totalPages.value) page.value++
}

const filterExpenses = () => {
    filterNotFound.value = false

    if (filterStartDate.value && filterEndDate.value) {
        filterByDate()
    } else if (filterMonth.value) {
        filterByMonth()
    } else {
        filterNotFound.value = true
        return
    }
}

const clearFilters = () => {
    filterMonth.value = ''
    filterStartDate.value = ''
    filterEndDate.value = ''
    filteredExpenses.value = []
    totalAmount.value = 0
}

const renderChart = () => {
    const ctx = document.getElementById('expenseChart')

    if (chartInstance) chartInstance.destroy()

    const categories = [
        'อาหารและน้ำดื่ม',
        'ค่าเดินทาง',
        'ค่าบริการรายเดือน',
        'อื่นๆ',
    ]
    const sums = categories.map((cat) =>
        expenses.value
            .filter((e) => e.type === cat)
            .reduce((acc, cur) => acc + cur.amount, 0)
    )

    chartInstance = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: categories,
            datasets: [
                {
                    label: 'ค่าใช้จ่าย',
                    data: sums,
                    backgroundColor: [
                        '#3b82f6',
                        '#10b981',
                        '#f59e0b',
                        '#ef4444',
                    ],
                },
            ],
        },
    })
}

const getTypeStyle = (type) => {
    let color = ''
    switch (type) {
        case 'อาหารและน้ำดื่ม':
            color = '#3b82f6' // blue
            break
        case 'ค่าเดินทาง':
            color = '#10b981' // green
            break
        case 'ค่าบริการรายเดือน':
            color = '#f59e0b' // yellow
            break
        case 'อื่นๆ':
            color = '#ef4444' // red
            break
        default:
            color = '#000000' // black
    }
    return `color: ${color};`
}

// add expense
const addExpense = async () => {
    if (!title.value || !amount.value) return
    !auth.currentUser
        ? alert('You must be logged in to add an expense.')
        : console.log('User is logged in, proceed to add expense.')

    try {
        // สร้าง reference ของ collection "expenses"
        const colRef = collection(db, 'expenses')

        const docRef = doc(colRef)
        await setDoc(docRef, {
            id: docRef.id,
            title: title.value,
            amount: Number(amount.value),
            type: type.value,
            createdAt: serverTimestamp(),
            clientCreatedAt: Timestamp.now(),
            uid: auth.currentUser?.uid,
        })
    } catch (error) {
        console.log('Error adding expense: ', error)
    }

    title.value = ''
    amount.value = 0
}

const startSnapshotListenerForUser = (uid) => {
    const q = query(
        collection(db, 'expenses'),
        where('uid', '==', uid), // ต้องมี เพื่อจำกัดเอกสารของผู้ใช้เท่านั้น
        orderBy('createdAt', 'desc'), // เรียงชั้นที่ 1: createdAt ล่าสุดก่อน
        orderBy('type', 'asc') // เรียงชั้นที่ 2: type (A→Z)
    )

    return onSnapshot(
        q,
        (snapshot) => {
            const list = []

            snapshot.forEach((doc) => list.push({ id: doc.id, ...doc.data() }))

            expenses.value = list
            allExpenses.value = list
            total.value = calcTotal()

            renderChart()
            resetTableIfNewMonth()
        },
        (err) => {
            console.error('onSnapshot error:', err) // debug ง่ายขึ้น
        }
    )
}

// กรองตามช่วงวันที่
const filterByDate = () => {
    if (!filterStartDate.value || !filterEndDate.value) return

    noDataFound.value = false

    const start = new Date(filterStartDate.value)
    const end = new Date(filterEndDate.value)
    end.setHours(23, 59, 59) // ครบวัน

    filteredExpenses.value = expenses.value.filter((e) => {
        const created = e.createdAt.toDate
            ? e.createdAt.toDate()
            : new Date(e.createdAt)
        return created >= start && created <= end
    })

    totalFiltered.value = filteredExpenses.value.reduce(
        (acc, cur) => acc + cur.amount,
        0
    )

    if (filteredExpenses.value.length === 0) {
        noDataFound.value = true
    } else {
        noDataFound.value = false
    }
}

// กรองตามเดือน/ปี
const filterByMonth = () => {
    if (!filterMonth.value) return

    noDataFound.value = false

    const [year, month] = filterMonth.value.split('-')
    filteredExpenses.value = expenses.value.filter((e) => {
        // แปลง createdAt จาก Firestore Timestamp เป็น JS Date
        const created = e.createdAt.toDate
            ? e.createdAt.toDate()
            : new Date(e.createdAt)
        return (
            created.getFullYear() === +year && created.getMonth() === +month - 1
        )
    })

    totalFiltered.value = filteredExpenses.value.reduce(
        (acc, cur) => acc + cur.amount,
        0
    )

    if (filteredExpenses.value.length === 0) {
        noDataFound.value = true
    } else {
        noDataFound.value = false
    }
}

// ฟังก์ชันคำนวณ total
const calcTotal = () => {
    return (total.value = expenses.value.reduce(
        (sum, e) => sum + (e.amount || 0),
        0
    ))
}

// ฟังก์ชันล้างตารางทุกวันที่ 1
const resetTableIfNewMonth = () => {
    const today = new Date()
    if (today.getDate() === 1) {
        expenses.value = [] // เคลียร์แค่ UI
    } else {
        expenses.value = allExpenses.value
    }
}

const resetTable = () => {
    filteredExpenses.value = []
    totalFiltered.value = 0
    filterStartDate.value = null
    filterEndDate.value = null
    filterMonth.value = null
}

// fetch expenses
onMounted(() => {
    onAuthStateChanged(auth, (user) => {
        // เคลียร์ listener เก่าก่อนทุกครั้ง
        if (unsubscribeSnapshot) {
            unsubscribeSnapshot()
            unsubscribeSnapshot = null
        }

        expenses.value = []

        if (!user) return

        const txCol = collection(db, 'expenses')
        const q = query(
            txCol,
            where('uid', '==', user.uid),
            orderBy('createdAt', 'desc'),
            orderBy('type', 'asc')
        )

        unsubscribeSnapshot = onSnapshot(
            q,
            (snap) => {
                expenses.value = snap.docs.map((d) => ({
                    id: d.id,
                    ...d.data(),
                }))
            },
            (err) => {
                console.error('onSnapshot error:', err) // debug ง่ายขึ้น
            }
        )

        startSnapshotListenerForUser(user.uid)
    })
})

onBeforeUnmount(() => {
    if (unsubscribeSnapshot) unsubscribeSnapshot()
})

// logout
const logout = async () => {
    await signOut(auth)
    window.location.href = '/login'
}
</script>
