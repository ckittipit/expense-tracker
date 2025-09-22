<template>
    <div class="p-6 max-w-4xl mx-auto">
        <h1 class="text-2xl font-bold mb-4">Expense Dashboard</h1>

        <button
            @click="logout"
            class="bg-red-500 text-white px-4 py-2 rounded mb-4"
        >
            Logout
        </button>

        <div class="flex gap-2">
            <input type="date" v-model="startDate" class="border p-2 rounded" />
            <input type="date" v-model="endDate" class="border p-2 rounded" />
            <button
                class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
                กรองข้อมูล
            </button>
        </div>

        <!-- ✅ Summary -->
        <div class="bg-gray-500 p-4 rounded shadow">
            <h2 class="text-xl font-semibold">รวมทั้งหมด: {{ total }} บาท</h2>
        </div>

        <!-- ✅ Chart -->
        <div class="bg-white p-4 rounded shadow">
            <canvas id="expenseChart"></canvas>
        </div>

        <form @submit.prevent="addExpense" class="flex gap-2 mb-4">
            <input
                v-model="title"
                type="text"
                placeholder="Title"
                class="border p-2 rounded flex-1"
            />
            <input
                v-model.number="amount"
                type="number"
                placeholder="Amount"
                class="border p-2 rounded w-32"
            />
            <select v-model="type" class="border p-2 rounded w-full mb-2">
                <option>อาหารและน้ำดื่ม</option>
                <option>ค่าเดินทาง</option>
                <option>ค่าบริการรายเดือน</option>
                <option>อื่นๆ</option>
            </select>
            <button class="bg-green-500 text-white px-4 rounded">Add</button>
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
            <tbody>
                <tr v-for="expense in expenses" :key="expense.id">
                    <td class="border p-2">{{ expense.title }}</td>
                    <td class="border p-2">{{ expense.amount }}</td>
                    <td class="border p-2">{{ expense.type }}</td>
                    <td class="border p-2">
                        {{ expense.createdAt?.toDate().toLocaleString() }}
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { auth, db } from '../firebase/config'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import {
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
const expenses = ref([])
const title = ref('')
const amount = ref(0)
const total = ref(0)
const startDate = ref('')
const endDate = ref('')
const lastSnapshot = ref(0)
const type = ref('ค่าอาหารและน้ำดื่ม')

let removeAuthListener = null
let unsubscribeSnapshot = null
let currentUid = null

const filterMonth = ref('')
const filterType = ref('')

// ฟังก์ชันตั้ง listener
const startSnapshotListenerForUser = (uid) => {
    // หากเคยสมัคร listener ก่อนให้ยกเลิก
    if (unsubscribeSnapshot) {
        unsubscribeSnapshot()
        unsubscribeSnapshot = null
    }

    currentUid = uid
    // Query แบบกรองตาม uid — ปลอดภัยกว่า (แสดงเฉพาะของ user นี้)
    // เริ่มไม่ใส่ orderBy ก่อน เพื่อให้แน่ใจว่าเอกสารจะถูกส่งกลับ
    const q = query(
        collection(db, 'expenses'),
        where('uid', '==', auth.currentUser?.uid),
        orderBy('createdAt', 'desc')
    )

    onSnapshot(q, (snapshot) => {
        const list = []
        let sum = 0
        snapshot.forEach((doc) => {
            const data = doc.data()
            list.push({ id: doc.id, ...data })
            sum += data.amount
        })
        expenses.value = list
        total.value = sum
        renderChart()
    })
}

const renderChart = () => {
    const ctx = document.getElementById('expenseChart')
    console.log('chartInstance: ', chartInstance)
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

// chart data
const pieData = computed(() => ({
    labels: Object.keys(groupedByType.value),
    datasets: [
        {
            data: Object.values(groupedByType.value),
            backgroundColor: ['#60a5fa', '#34d399', '#fbbf24', '#f87171'],
        },
    ],
}))

// add expense
const addExpense = async () => {
    if (!title.value || !amount.value) return
    !auth.currentUser
        ? alert('You must be logged in to add an expense.')
        : console.log(auth.currentUser)

    try {
        await addDoc(collection(db, 'expenses'), {
            title: title.value,
            amount: Number(amount.value),
            type: type.value,
            createdAt: serverTimestamp(),
            clientCreatedAt: Timestamp.now(),
            uid: auth.currentUser?.uid ?? null,
        })
        console.log('document added id:', docRef.id)
    } catch (error) {
        console.log('Error adding expense: ', error)
    }

    title.value = ''
    amount.value = 0
}

// const total = computed(() =>
//     expenses.value.reduce((sum, e) => sum + Number(e.amount || 0), 0)
// )

// filter data
const filteredExpenses = computed(() => {
    return expenses.value.filter((e) => {
        const matchMonth = filterMonth.value
            ? new Date(e.createdAt.seconds * 1000).getMonth() + 1 ===
              Number(filterMonth.value)
            : true
        const matchType = filterType.value ? e.type === filterType.value : true
        return matchMonth && matchType
    })
})

// group by type
const groupedByType = computed(() => {
    const map = {}
    filteredExpenses.value.forEach((e) => {
        map[e.type] = (map[e.type] || 0) + Number(e.amount)
    })
    return map
})

// group by month
const groupedByMonth = computed(() => {
    const map = {}
    filteredExpenses.value.forEach((e) => {
        const month = new Date(e.createdAt.seconds * 1000).toLocaleString(
            'en',
            { month: 'short' }
        )
        map[month] = (map[month] || 0) + Number(e.amount)
    })
    return map
})

// fetch expenses
onMounted(() => {
    // รอ auth ready ก่อนตั้ง listener — ถ้า user ยัง login อยู่ onAuthStateChanged จะเรียกทันที
    removeAuthListener = onAuthStateChanged(auth, (user) => {
        // console.log('onAuthStateChanged', user && user.uid)
        if (user) {
            startSnapshotListenerForUser(user.uid)
        } else {
            // หาก logout: clear data และ unsubscribe
            if (unsubscribeSnapshot) {
                unsubscribeSnapshot()
                unsubscribeSnapshot = null
            }
            expenses.value = []
        }
    })
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
