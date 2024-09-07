import Image from 'next/future/image'
import image3 from '@/images/avatars/testimony3.jpeg'
import dollieLogo from '@/images/logos/logo-dollie.png'
import wingarcLogo from '@/images/logos/logo-wingarc.png'
import aoyagi from '@/images/avatars/aoyagi.jpg'

export function Testimonials({ teamCount }) {
  return (
    <section className="my-auto hidden lg:block">
      <div className="mx-auto mb-10 max-w-2xl text-white md:text-center">
        <h2 className="font-display text-xl tracking-tight sm:text-3xl">
          Join <span className="font-medium text-teal-100">{teamCount}+</span> other happy
          users!
        </h2>
      </div>
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto grid max-w-2xl grid-cols-1 lg:mx-0 lg:max-w-none xl:grid-cols-2">
          <div className="flex flex-col pb-8 pr-0 xl:pb-0 xl:pr-16">
            <Image
              className="self-start"
              src={dollieLogo}
              alt="Dollie Logo"
              width={125}
              height={32}
            />
            <figure className="mt-10 flex flex-auto flex-col justify-between">
              <blockquote className="text-lg leading-8 text-white">
                <p>
                  “Huge fan of this... We're using it for our product Dollie, to index our knowledge
                  base and our site to provide first line of support for our customers and help them
                  get started faster with our product using the embedded widget.”
                </p>
              </blockquote>
              <figcaption className="mt-10 flex items-center gap-x-6">
                <Image className="h-14 w-14 rounded-full bg-gray-400" src={image3} alt="" />
                <div className="text-base">
                  <div className="font-semibold text-white">Bowe Frankema</div>
                  <div className="mt-1 text-gray-100">Founder Dollie</div>
                </div>
              </figcaption>
            </figure>
          </div>
          <div className="flex flex-col border-t border-white/10 pt-8 xl:border-l xl:border-t-0 xl:pl-16 xl:pt-0">
          <Image
              className="self-start"
              src={wingarcLogo}
              alt="WingArc1st Logo"
              width={137}
              height={36}
            />
            <figure className="mt-10 flex flex-auto flex-col justify-between">
              <blockquote className="text-lg leading-8 text-white">
                <p>
                  “DocsBotは、AIボット運用における私たちのニーズを完璧に把握し、信じられないほどの速さで新機能を追加しています。この素晴らしいパートナーシップに心から感謝します！”
                </p>
              </blockquote>
              <figcaption className="mt-10 flex items-center gap-x-6">
                <Image className="h-14 w-14 rounded-full bg-gray-400" src={aoyagi} alt="" />
                <div className="text-base">
                  <div className="font-semibold text-white">Yukitoshi Aoyagi</div>
                  <div className="mt-1 text-gray-100">
                  Customer Success 部長 @ ウイングアーク1st株式会社
                  </div>
                </div>
              </figcaption>
            </figure>
          </div>
        </div>
      </div>
    </section>
  )
}
