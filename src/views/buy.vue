<template>
    <div>


        <section
                class="signin section illustration-section-01"
                :class="[
            hasBgColor && 'has-bg-color',
            invertColor && 'invert-color'
        ]">
            <div class="container">
                <div
                        class="signin-inner section-inner"
                        :class="[
                    topDivider && 'has-top-divider',
                    bottomDivider && 'has-bottom-divider'
                ]">
                    <c-section-header tag="h1" :data="sectionHeader" class="center-content"/>
                    <c-generic-section top-divider class="center-content">
                        <div class="container-xs">
                            <c-section-header :data="genericSection01Header" class="center-content"/>
                            <div class="button-group">
                                <c-button tag="a" color="primary" wide-mobile target="_blank"
                                          href="https://v1exchange.pancakeswap.finance/#/swap?outputCurrency=0x0321394309CaD7E0E424650844c3AB3b659315d3">
                                    Buy on PancakeSwap V1
                                </c-button>
                              <c-button tag="a" color="primary" wide-mobile target="_blank"
                                        href="https://exchange.pancakeswap.finance/#/swap?outputCurrency=0x0321394309CaD7E0E424650844c3AB3b659315d3">
                                Buy on PancakeSwap V2
                              </c-button>


                            </div>
                        </div>
                    </c-generic-section>
                </div>
            </div>
        </section>
    </div>
</template>

<script>
    // import layout
    import CLayout from '@/layouts/LayoutDefault.vue'
    // import sections
    import CSectionHeader from '@/components/sections/partials/SectionHeader.vue'
    import {SectionProps} from '@/utils/SectionProps.js'

    import CGenericSection from '@/components/sections/GenericSection.vue'
    import CButton from '@/components/elements/Button.vue'

    export default {
        name: 'Login',
        components: {
            CSectionHeader,
            CGenericSection,
            CButton
        },
        mixins: [SectionProps],
        created() {
            this.$emit('update:layout', CLayout)
        },
        data() {
            let v = this
            return {
                sectionHeader: {
                    title: v.$t('buy.section_header.title')
                }
            }
        }
    }
</script>
