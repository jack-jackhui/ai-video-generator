import { Spacer, Divider, Link, Image } from "@nextui-org/react";
import { FaXTwitter } from "react-icons/fa6";
import { FaGithub } from "react-icons/fa";
import { FaLinkedinIn } from "react-icons/fa";

const Footer = () => {
    return (
        <>
        <footer className="p-2">
            <div className="max-w-6xl mx-auto px-4">
                <Divider />
                <Spacer y={6} />
                <div className="flex flex-wrap justify-center items-center -mx-4">
                    {/* Resources column */}
                    <div className="px-6 mb-6">
                        <h4 className="text-md mb-2">Resources</h4>
                        <ul className="list-none">
                            <li className="mb-2">
                                <Link href="#" color="foreground" className="hover:text-gray-400 text-md">Docs</Link>
                            </li>
                            {/* More links */}
                        </ul>
                    </div>
                    {/* More column */}
                    <div className="px-6 mb-6">
                        <h4 className="text-md mb-2">More</h4>
                        <ul className="list-none">
                            <li className="mb-2">
                                <Link href="#" color="foreground" className="hover:text-gray-400 text-md">.</Link>
                            </li>
                            {/* More links */}
                        </ul>
                    </div>
                </div>


                <Spacer y={1} />

                <div className="">
                    <div className="flex justify-center items-center space-x-4 mt-4">
                        <Link href="https://jackhui.com.au" target="_blank" color="foreground" className="hover:text-">
                        <p className="text-slate-400">© 2024 JackHui.com.au</p>
                        </Link>
                        {/* Icons */}
                        <Link href="https://www.twitter.com/realjackhui" color="foreground" className="hover:text-">
                            <FaXTwitter />
                            {/*<Image width={25} height={25} src="/images/x.svg" alt="X" />*/}
                        </Link>

                        <Divider orientation="vertical" style={{ backgroundColor: "white", height: "1rem"  }} />
                        <Link href="https://github.com/jack-jackhui" color="foreground" className="hover:text-">
                            <FaGithub />
                            {/*<Image width={25} height={25} src="/images/github.svg" alt="Github" />*/}
                        </Link>
                        <Divider orientation="vertical" style={{ backgroundColor: "white", height: "1rem"  }} />
                        <Link href="https://linkedin.com/in/jackhui888" color="foreground" className="hover:text-">
                            <FaLinkedinIn />
                        </Link>

                    </div>
                </div>
            </div>
        </footer>
            </>
    );
};

export default Footer;
