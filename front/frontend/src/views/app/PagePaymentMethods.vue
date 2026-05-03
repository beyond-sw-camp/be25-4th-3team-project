<script setup>
import { ref, computed, onMounted } from 'vue'
import BaseButton from '../../components/common/BaseButton.vue'
import {
  deleteCard as deleteCardRequest,
  getCardDetail,
  getCards,
  postCard,
  toggleCard as toggleCardRequest,
} from '../../api/cardApi.js'

/* 카드 정보 — 요청은 공통 api(/api) → Vite 프록시 → 모놀리식 백엔드 */

const cards = ref([])

const showAdd = ref(false)
const showDetail = ref(false)
const detail = ref({})

const newCard = ref({
cardType:'',
cardNumber:'',
cvc:'',
expiry:''
})

function resetNewCard() {
newCard.value = {
cardType:'',
cardNumber:'',
cvc:'',
expiry:''
}
}

function openAddCardModal() {
resetNewCard()
showAdd.value = true
}

function closeAddCardModal() {
showAdd.value = false
resetNewCard()
}

/* ---------------- 카드 목록 로드 ---------------- */

async function loadCards() {
  try {
    const res = await getCards()
    cards.value = Array.isArray(res.data) ? res.data : res.data?.content ?? []
  } catch (e) {
    console.error(e)
  }
}

/* ---------------- 페이지네이션 ---------------- */

const currentPage = ref(1)
const cardsPerPage = 6

const totalPages = computed(()=>{
const pages = Math.ceil(cards.value.length / cardsPerPage)
return pages === 0 ? 1 : pages
})

const pageNumbers = computed(()=>{
return Array.from({length: totalPages.value}, (_,i)=> i+1)
})

const paginatedCards = computed(()=>{
const start = (currentPage.value-1)*cardsPerPage
const end = start + cardsPerPage
return cards.value.slice(start,end)
})

function changePage(page){
currentPage.value = page
}

function prevPage(){
if(currentPage.value > 1) currentPage.value--
}

function nextPage(){
if(currentPage.value < totalPages.value) currentPage.value++
}

function resolvePaymentPriority(card, index){
return card.paymentPriority ?? (currentPage.value - 1) * cardsPerPage + index + 1
}

/* ---------------- 카드 포맷 ---------------- */

function formatCardNumber(num){
if(!num) return ''
return num.replace(/(\d{4})(?=\d)/g,'$1 ')
}

/* 카드번호 자동 하이픈 */

function formatInputCard(){

let value = newCard.value.cardNumber.replace(/[^0-9]/g,'')

value = value.slice(0,16)

const parts = value.match(/.{1,4}/g)

newCard.value.cardNumber = parts ? parts.join('-') : value

}

/* CVC 숫자만 */

function formatCVC(){
newCard.value.cvc = newCard.value.cvc.replace(/\D/g,'')
}

/* expiry */

function formatExpiry(){

let value = newCard.value.expiry.replace(/\D/g,'')

if(value.length >=3){
value = value.substring(0,2) + '/' + value.substring(2,4)
}

newCard.value.expiry = value

}

function isExpiredCard(expiry) {
const [monthText, yearText] = expiry.split('/')
const month = Number(monthText)
const year = Number(yearText)

if (!Number.isInteger(month) || !Number.isInteger(year) || month < 1 || month > 12) {
return true
}

const fullYear = 2000 + year
const now = new Date()
const currentYear = now.getFullYear()
const currentMonth = now.getMonth() + 1

return fullYear < currentYear || (fullYear === currentYear && month < currentMonth)
}

/* ---------------- 카드 기능 ---------------- */

async function addCard(){

try{

if(isExpiredCard(newCard.value.expiry)){
alert('카드 유효기간을 확인해주세요.')
return
}

const body = {
cardType:newCard.value.cardType,
cardNumber:newCard.value.cardNumber,
cvc:newCard.value.cvc,
expiry:newCard.value.expiry
}

console.log("보내는 카드번호:", body.cardNumber)

    await postCard(body)

closeAddCardModal()

await loadCards()

currentPage.value = totalPages.value

}catch(e){

console.error(e)

if(e.response){
alert(e.response.data)
}else{
alert('서버 연결 실패')
}

}

}


async function removeCard(id){

if(confirm('카드를 삭제할까요?')){

    await deleteCardRequest(id)

await loadCards()

if(currentPage.value > totalPages.value){
currentPage.value = totalPages.value
}

}

}

async function flipCardActive(id) {
  await toggleCardRequest(id)
  await loadCards()
}

async function openDetail(card){

    const res = await getCardDetail(card.id)

detail.value = res.data

showDetail.value = true

}

onMounted(()=>{
loadCards()
})

</script>

<template>


<div class="page-wrapper">

<div class="top-bar">
<h2 class="title">카드 목록</h2>
<BaseButton @click="openAddCardModal">카드 추가</BaseButton>

</div>

<p class="card-order-notice">
※ 카드는 등록한 순서대로 소싱 상품의 자동 결제에 사용됩니다.
</p>


<!-- 카드 리스트 -->

<div class="card-container">

<p v-if="cards.length === 0" class="empty-card-message">
등록된 카드 정보가 없습니다.
</p>

<div
v-for="(card, index) in paginatedCards"
:key="card.id"
class="card"
:class="[card.cardType,{inactive:!card.active}]"
>

<div class="card-top ">
<span>{{card.cardType}}</span>
<span class="priority-badge">자동 결제 {{resolvePaymentPriority(card, index)}}순위</span>
</div>

<div class="card-number">
{{formatCardNumber(card.cardNumber)}}
</div>

<div class="card-bottom">
<span>{{card.expiry}}</span>
</div>

<!-- hover -->

<div class="card-overlay">

<button @click.stop="flipCardActive(card.id)">
{{card.active ? '비활성' : '활성'}}
</button>

<button
class="delete"
@click.stop="removeCard(card.id)"
>
삭제
</button>

<button
@click.stop="openDetail(card)"
>
상세
</button>

</div>

</div>

</div>

<!-- pagination -->

<div class="pagination">

<button @click="prevPage">◀</button>

<button
v-for="page in pageNumbers"
:key="page"
@click="changePage(page)"
:class="{active:page===currentPage}"
>
{{page}}
</button>

<button @click="nextPage">▶</button>

</div>

<!-- 카드 추가 -->

<div v-if="showAdd" class="modal">

<div class="modal-box">

<h3>카드 등록</h3>

<select v-model="newCard.cardType">
<option disabled value="">카드사 선택</option>
<option value="VISA">VISA</option>
<option value="MasterCard">MasterCard</option>
<option value="Kakao">Kakao</option>
</select>

<input
v-model="newCard.cardNumber"
@input="formatInputCard"
placeholder="카드번호"
/>

<input
v-model="newCard.cvc"
@input="formatCVC"
maxlength="3"
placeholder="CVC"
/>

<input
v-model="newCard.expiry"
@input="formatExpiry"
maxlength="5"
placeholder="MM/YY"
/>

<button @click="addCard">등록</button>

<button @click="closeAddCardModal">닫기</button>

</div>

</div>

<!-- 카드 상세 -->

<div v-if="showDetail" class="modal">

<div class="modal-box">

<h3>카드 상세</h3>

<div>번호 : {{detail.cardNumber}}</div>
<div>잔액 : {{detail.balance}}</div>
<div>한도 : {{detail.cardLimit}}</div>
<div>CVC : {{detail.cvc}}</div>
<div>만료 : {{detail.expiry}}</div>

<button @click="showDetail=false">닫기</button>

</div>

</div>

</div>

</template>

<style scoped>

/* 전체 페이지 */

.page-wrapper{
min-height:90vh;
display:flex;
flex-direction:column;
}

/* 카드 영역 */

.card-container{
display:grid;
grid-template-columns:repeat(3, minmax(0, 1fr));
gap:32px;
align-items:stretch;

border:1px solid #ddd;
border-radius:12px;
padding:60px;
background:#fafafa;

width: 100%;
min-height: 340px;
max-width: 100%;
margin: 0 auto;
box-sizing: border-box;

}

.empty-card-message{
grid-column:1 / -1;
width:100%;
text-align:center;
color:#666;
font-size:16px;
}



/* 카드 */

.card{
width:100%;
min-height:200px;
aspect-ratio:1.6 / 1;
border-radius:15px;
padding:20px;
color:white;
display:flex;
flex-direction:column;
justify-content:space-between;
position:relative;
overflow:hidden;
box-shadow:0 10px 25px rgba(0,0,0,0.15);
cursor:pointer;
}

/* hover */

.card-overlay{
position:absolute;
inset:0;
background:rgba(0,0,0,0.45);
display:flex;
justify-content:center;
align-items:center;
gap:10px;
opacity:0;
transition:0.25s;
}

.card:hover .card-overlay{
opacity:1;
}

.card-overlay button{
padding:6px 12px;
border:none;
border-radius:6px;
cursor:pointer;
background:white;
color:black;
font-size:13px;
}

.card-overlay .delete{
background:#ff4d4d;
color:white;
}

/* VISA */

.card.VISA{
background:linear-gradient(135deg,#1a1f71,#3a47d5);
}

.card.VISA::after{
content:"VISA";
position:absolute;
right:20px;
bottom:20px;
font-size:28px;
font-weight:bold;
}

/* MASTER */

.card.MasterCard{
background:linear-gradient(135deg,#2b2b2b,#000);
}

.card.MasterCard::before{
content:"";
position:absolute;
width:60px;
height:60px;
border-radius:50%;
background:#EB001B;
right:60px;
bottom:25px;
}

.card.MasterCard::after{
content:"";
position:absolute;
width:60px;
height:60px;
border-radius:50%;
background:#F79E1B;
right:20px;
bottom:25px;
}

/* KAKAO */

.card.Kakao{
background:#ffe812;
color:black;
}

.card.Kakao::after{
content:"KAKAOPAY";
position:absolute;
right:20px;
bottom:20px;
font-size:20px;
font-weight:bold;
}

.card-number{
font-size:22px;
letter-spacing:3px;
font-family:monospace;
}

.card-top{
font-size:18px;
font-weight:bold;
display:flex;
align-items:center;
justify-content:space-between;
gap:12px;
position:relative;
z-index:1;
}

.priority-badge{
border-radius:999px;
background:rgba(255,255,255,0.22);
padding:5px 10px;
font-size:12px;
font-weight:lighter;
white-space:nowrap;
}

.card-bottom{
display:flex;
justify-content:space-between;
}

.inactive{
opacity:0.4;
}

/* pagination */

.pagination{
display:flex;
justify-content:center;
gap:8px;
padding:30px 0;
}

.pagination button{
padding:6px 12px;
border:none;
background:#eee;
cursor:pointer;
border-radius:5px;
}

.pagination button.active{
background:#333;
color:white;
}

/* modal */

.modal{
position:fixed;
top:0;
left:0;
width:100%;
height:100%;
background:rgba(0,0,0,0.4);
display:flex;
justify-content:center;
align-items:center;
}

.modal-box{
background:white;
padding:20px;
border-radius:10px;
display:flex;
flex-direction:column;
gap:10px;
}

input{
padding:8px;
}

.top-bar{
margin-bottom:20px;

display:flex;
justify-content:space-between;  /* 🔥 핵심 */
align-items:center;
}

.card-order-notice{
margin-bottom:16px;
border:1px solid #fed7aa;
border-radius:8px;
background:#fff7ed;
padding:12px 14px;
color:#9a3412;
font-size:14px;
font-weight:300;
}

.title{
font-size:20px;
font-weight:bold;
}

@media (max-width: 1100px){
.card-container{
grid-template-columns:repeat(2, minmax(0, 1fr));
}
}

@media (max-width: 520px){
.card-container{
grid-template-columns:1fr;
padding:24px;
}
}

</style>
