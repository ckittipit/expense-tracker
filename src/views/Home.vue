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
                            v-for="expense in expenses"
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
                    </tbody>
                </table>
            </div>
            <div class="my-8">
                <h2 class="text-xl font-bold mb-4">Expense Chart</h2>
                <canvas id="expenseChart" width="400" height="200"></canvas>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { auth, db } from '../firebase/config'
import { signOut } from 'firebase/auth'
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

let removeAuthListener = null
let unsubscribeSnapshot = null
let currentUid = null

const filteredExpenses = ref([]) // ข้อมูลหลัง filter
const totalFiltered = ref(0)
const filterStartDate = ref(null)
const filterEndDate = ref(null)
const filterMonth = ref(null) // 'YYYY-MM'
const totalAmount = ref(0)
const filterNotFound = ref(false)
const noDataFound = ref(false)
// const filterType = ref('')

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
        where('uid', '==', uid) // 👈 ต้องมี ไม่งั้นอ่านไม่ได้
    )

    return onSnapshot(q, (snapshot) => {
        const list = []
        let sum = 0
        snapshot.forEach((doc) => {
            const data = doc.data()
            list.push({ id: doc.id, ...data })
            // sum += data.amount
        })
        expenses.value = list
        allExpenses.value = list
        total.value = calcTotal()

        renderChart()
        resetTableIfNewMonth()
    })
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
    // filteredExpenses.value = [...expenses.value]
    // totalFiltered.value = expenses.value.reduce(
    //     (acc, cur) => acc + cur.amount,
    //     0
    // )
    filteredExpenses.value = []
    totalFiltered.value = 0
    filterStartDate.value = null
    filterEndDate.value = null
    filterMonth.value = null
}

// fetch expenses
onMounted(() => {
    const user = auth.currentUser
    if (user) {
        console.log('✅ User logged in')
        startSnapshotListenerForUser(user.uid)
    } else {
        console.log('❌ No user')
    }
})

onUnmounted(() => {
    if (removeAuthListener) removeAuthListener()
    if (unsubscribeSnapshot) unsubscribeSnapshot()
})

// logout
const logout = async () => {
    await signOut(auth)
    window.location.href = '/login'
}
</script>
