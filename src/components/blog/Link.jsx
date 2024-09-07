import PropTypes from 'prop-types';
import { removeSourceUrl } from '@headstartwp/core';
import { useSettings } from '@headstartwp/core/react';
import NextLink from 'next/link';

export const Link = ({ href, target, rel, children }) => {
	const settings = useSettings();
	const link = removeSourceUrl({ link: href, backendUrl: settings.sourceUrl || '' });
console.log('Link', link);
	return (
		<NextLink href={link} target={target} rel={rel}>
			{children}
		</NextLink>
	);
};

Link.propTypes = {
	href: PropTypes.string.isRequired,
	target: PropTypes.string,
	rel: PropTypes.string,
	children: PropTypes.node.isRequired,
};

Link.defaultProps = {
	target: '',
	rel: '',
};
